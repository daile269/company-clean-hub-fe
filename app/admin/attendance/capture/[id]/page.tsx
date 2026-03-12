"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { CameraService } from "@/services/cameraService";
import { FaceMeshService } from "@/services/faceMeshService";
import { GpsService, GpsCoords } from "@/services/gpsService";
import { AUTO_CAPTURE_CONFIG } from "@/config/autoCaptureConfig";
import { estimateFacePose, computeSharpness, computeBrightness } from "@/utils/faceUtils";
import { assignmentService, Assignment } from "@/services/assignmentService";
import attendanceService, { Attendance } from "@/services/attendanceService";
import { authService } from "@/services/authService";

export default function AutoCapturePage() {
  const params = useParams();
  const assignmentId = params?.id ? Number(params.id) : null;
  const router = useRouter();
  
  // Refs for services and elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const cameraServiceRef = useRef<CameraService | null>(null);
  const faceMeshServiceRef = useRef<FaceMeshService | null>(null);
  const gpsServiceRef = useRef<GpsService | null>(null);
  
  // State
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [status, setStatus] = useState({ text: "Đang khởi tạo...", type: "waiting" });
  const [gpsData, setGpsData] = useState<{ status: string; coords: GpsCoords | null; error: string | null }>({
    status: "⏳ Đang tìm tín hiệu GPS...",
    coords: null,
    error: null
  });
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Constants & Mutable state for the loop
  const stableStartTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isSendingRef = useRef(false);

  const user = authService.getCurrentUser();

  // Load Initial Data
  useEffect(() => {
    if (!assignmentId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const [assignData, attData] = await Promise.all([
          assignmentService.getById(assignmentId),
          attendanceService.getTodayAttendanceByAssignment(assignmentId)
        ]);
        
        if (!assignData) {
          toast.error("Không tìm thấy thông tin phân công");
          router.push("/admin/attendance/today-tasks");
          return;
        }
        
        setAssignment(assignData);
        setAttendance(attData);
        
        if (attData && attData.evaluationStatus === 'APPROVED') {
            toast.success("Công việc này đã được duyệt chấm công hôm nay.");
            router.push("/admin/attendance/today-tasks");
            return;
        }
      } catch (error) {
        console.error("Error loading capture data:", error);
        toast.error("Lỗi khi tải thông tin");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [assignmentId, router]);

  // UI Status Helper
  const updateStatus = useCallback((text: string, type: string = "waiting") => {
    setStatus({ text, type });
  }, []);

  // Image Processing Helpers
  const getFaceCrop = useCallback((landmarks: any) => {
    if (!videoRef.current || !cameraServiceRef.current) return null;
    
    if (!tempCanvasRef.current) {
        tempCanvasRef.current = document.createElement('canvas');
    }
    const tempCanvas = tempCanvasRef.current;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;

    try {
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;

      for (const lm of landmarks) {
        if (lm.x < minX) minX = lm.x;
        if (lm.x > maxX) maxX = lm.x;
        if (lm.y < minY) minY = lm.y;
        if (lm.y > maxY) maxY = lm.y;
      }

      const padX = (maxX - minX) * 0.15;
      const padY = (maxY - minY) * 0.15;
      minX = Math.max(0, minX - padX);
      maxX = Math.min(1, maxX + padX);
      minY = Math.max(0, minY - padY);
      maxY = Math.min(1, maxY + padY);

      const { width: vw, height: vh } = cameraServiceRef.current.dimensions;
      const sx = Math.floor(minX * vw);
      const sy = Math.floor(minY * vh);
      const sw = Math.max(1, Math.floor((maxX - minX) * vw));
      const sh = Math.max(1, Math.floor((maxY - minY) * vh));

      const dw = Math.min(sw, 96);
      const dh = Math.min(sh, 96);

      tempCanvas.width  = dw;
      tempCanvas.height = dh;
      tempCtx.drawImage(videoRef.current, sx, sy, sw, sh, 0, 0, dw, dh);

      return tempCtx.getImageData(0, 0, dw, dh);
    } catch (e) {
      return null;
    }
  }, []);

  const drawFaceBox = useCallback((landmarks: any) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (const lm of landmarks) {
      if (lm.x < minX) minX = lm.x;
      if (lm.x > maxX) maxX = lm.x;
      if (lm.y < minY) minY = lm.y;
      if (lm.y > maxY) maxY = lm.y;
    }

    const cw = canvas.width;
    const ch = canvas.height;

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth   = 2.5;
    ctx.strokeRect(
      minX * cw,
      minY * ch,
      (maxX - minX) * cw,
      (maxY - minY) * ch
    );
  }, []);

  const drawOverlay = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const padding = 10;
    const fontSize = Math.max(12, Math.floor(width / 50));
    ctx.font = `${fontSize}px Arial`;
    
    const lines = [];
    lines.push(`Thời gian: ${new Date().toLocaleString('vi-VN')}`);
    lines.push(`Nhân viên: ${user?.fullName || 'N/A'}`);
    lines.push(`Địa điểm: ${assignment?.customerName || 'N/A'}`);
    
    const gps = gpsServiceRef.current;
    if (gps && gps.coords) {
      lines.push(`GPS: ${gps.coords.latitude.toFixed(6)}, ${gps.coords.longitude.toFixed(6)} (±${gps.coords.accuracy.toFixed(1)}m)`);
      
      if (gps.addressPrimary) {
        lines.push(`Địa chỉ 1: ${gps.addressPrimary.slice(0, 50)}${gps.addressPrimary.length > 50 ? '...' : ''}`);
      }
      if (gps.addressNominatim) {
        lines.push(`Địa chỉ 2: ${gps.addressNominatim.slice(0, 50)}${gps.addressNominatim.length > 50 ? '...' : ''}`);
      }
    } else if (gps && gps.error) {
      lines.push(`Lỗi GPS: ${gps.error}`);
    }

    const lineHeight = fontSize * 1.3;
    const bgWidth = lines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0) + padding * 2;
    const bgHeight = lines.length * lineHeight + padding;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, height - bgHeight, bgWidth, bgHeight);

    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    lines.forEach((line, i) => {
      ctx.fillText(line, padding, height - bgHeight + padding / 2 + i * lineHeight);
    });
  }, [user, assignment]);

  const takePhoto = useCallback(async () => {
    setIsPaused(true);
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    setProgress(0);
    updateStatus('Đang xử lý ảnh...', 'capturing');

    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas || !cameraServiceRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = cameraServiceRef.current.dimensions;
    canvas.width  = width;
    canvas.height = height;

    // Draw flipped video to canvas
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    ctx.restore();

    // Draw info overlay
    drawOverlay(ctx, width, height);

    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataURL);
    updateStatus('Ảnh đã sẵn sàng', 'success');
  }, [updateStatus, drawOverlay]);

  const onFaceMeshResults = useCallback((results: any) => {
    if (isPaused) return;

    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const faces = results.multiFaceLandmarks || [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (faces.length === 0) {
      stableStartTimeRef.current = null;
      setProgress(0);
      updateStatus('Không tìm thấy khuôn mặt', 'warning');
      return;
    }
    if (faces.length > 1) {
      stableStartTimeRef.current = null;
      setProgress(0);
      updateStatus('Phát hiện nhiều khuôn mặt - vui lòng chỉ để 1 người', 'warning');
      return;
    }

    const landmarks = faces[0];
    drawFaceBox(landmarks);

    const { yawRatio, pitchOffset } = estimateFacePose(landmarks);

    if (Math.abs(yawRatio) > AUTO_CAPTURE_CONFIG.YAW_THRESHOLD) {
      stableStartTimeRef.current = null;
      setProgress(0);
      updateStatus(`Nhìn thẳng vào camera (đang xoay ${yawRatio > 0 ? 'trái' : 'phải'})`, 'warning');
      return;
    }

    if (Math.abs(pitchOffset) > AUTO_CAPTURE_CONFIG.PITCH_THRESHOLD) {
      stableStartTimeRef.current = null;
      setProgress(0);
      updateStatus(`Nhìn thẳng vào camera (đang cúi/ngẩng ${pitchOffset > 0 ? 'xuống' : 'lên'})`, 'warning');
      return;
    }

    const faceCrop = getFaceCrop(landmarks);
    if (!faceCrop) {
      stableStartTimeRef.current = null;
      setProgress(0);
      return;
    }

    const sharpness = computeSharpness(faceCrop);
    if (sharpness < AUTO_CAPTURE_CONFIG.SHARPNESS_THRESHOLD) {
      stableStartTimeRef.current = null;
      setProgress(0);
      updateStatus(`Ảnh bị mờ - vui lòng giữ yên điện thoại`, 'warning');
      return;
    }

    const brightness = computeBrightness(faceCrop);
    if (brightness < AUTO_CAPTURE_CONFIG.BRIGHTNESS_THRESHOLD) {
      stableStartTimeRef.current = null;
      setProgress(0);
      updateStatus(`Ánh sáng yếu - vui lòng đến nơi sáng hơn`, 'warning');
      return;
    }

    // Stable condition met
    const now = Date.now();
    if (!stableStartTimeRef.current) {
      stableStartTimeRef.current = now;
    }

    const elapsed = now - stableStartTimeRef.current;
    const percentage = Math.min(100, (elapsed / AUTO_CAPTURE_CONFIG.STABLE_DURATION_MS) * 100);
    setProgress(percentage);
    updateStatus('Đang giữ ổn định...', 'capturing');

    if (elapsed >= AUTO_CAPTURE_CONFIG.STABLE_DURATION_MS) {
      takePhoto();
    }
  }, [isPaused, updateStatus, drawFaceBox, getFaceCrop, takePhoto]);

  const runDetectionLoop = useCallback(async () => {
    if (isPaused) return;

    const video = videoRef.current;
    if (video && !isSendingRef.current && video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      isSendingRef.current = true;
      try {
        await faceMeshServiceRef.current?.send(video);
      } catch (e) {
        console.warn('[FaceMesh] send error:', e);
      } finally {
        isSendingRef.current = false;
      }
    }

    animFrameIdRef.current = requestAnimationFrame(runDetectionLoop);
  }, [isPaused]);

  // Initialize Services
  useEffect(() => {
    if (loading || !videoRef.current || !overlayCanvasRef.current) return;

    const initServices = async () => {
      if (!videoRef.current || !overlayCanvasRef.current) return;

      // 1. GPS
      gpsServiceRef.current = new GpsService({
        onUpdate: (data) => {
          setGpsData(prev => ({
            status: data.status || prev.status,
            coords: data.coords || prev.coords,
            error: data.error || null
          }));
        }
      });
      gpsServiceRef.current.startTracking();

      // 2. Camera
      cameraServiceRef.current = new CameraService(videoRef.current);
      try {
        await cameraServiceRef.current.start();
        const { width, height } = cameraServiceRef.current.dimensions;
        if (overlayCanvasRef.current) {
            overlayCanvasRef.current.width = width;
            overlayCanvasRef.current.height = height;
        }
      } catch (err) {
        console.error("Camera error:", err);
        updateStatus("Lỗi truy cập camera", "error");
        return;
      }

      // 3. FaceMesh
      faceMeshServiceRef.current = new FaceMeshService({
        onResults: onFaceMeshResults
      });
      try {
        await faceMeshServiceRef.current.init();
        updateStatus("Sẵn sàng - hãy nhìn thẳng vào camera", "ready");
        runDetectionLoop();
      } catch (err) {
        console.error("FaceMesh error:", err);
        updateStatus("Lỗi khởi tạo nhận diện mặt", "error");
      }
    };

    initServices();

    return () => {
      cameraServiceRef.current?.stop();
      gpsServiceRef.current?.stopTracking();
      faceMeshServiceRef.current?.close();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [loading, onFaceMeshResults, runDetectionLoop, updateStatus]);

  const handleUpload = async () => {
    if (!capturedImage || !attendance || !gpsData.coords || !gpsServiceRef.current) return;

    try {
      setIsUploading(true);
      const payload = {
        attendanceId: attendance.id,
        imageData: capturedImage, // This is base64
        latitude: gpsData.coords.latitude,
        longitude: gpsData.coords.longitude,
        address: gpsServiceRef.current.addressPrimary || gpsServiceRef.current.addressNominatim || "Không xác định"
      };

      await attendanceService.capture(payload);
      toast.success("Điểm danh thành công!");
      router.push("/admin/attendance/today-tasks");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Lỗi khi gửi dữ liệu lên server");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsPaused(false);
    stableStartTimeRef.current = null;
    setProgress(0);
    updateStatus("Sẵn sàng - hãy nhìn thẳng vào camera", "ready");
    runDetectionLoop();
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4">
      <Toaster position="top-right" />
      
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-2">
            <button 
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white flex items-center"
            >
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
            </button>
            <h1 className="text-xl font-bold text-blue-400">Chụp ảnh điểm danh</h1>
            <div className="w-20"></div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-sm border border-gray-700">
            <p className="font-semibold text-gray-300">{assignment?.customerName}</p>
            <p className="text-gray-500">{assignment?.contractDescription}</p>
        </div>
      </div>

      <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700">
        {!capturedImage ? (
          <>
            <video 
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover mirror scale-x-[-1]"
              playsInline
              muted
            />
            <canvas 
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
            />
            
            {progress > 0 && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <img 
            src={capturedImage} 
            className="absolute inset-0 w-full h-full object-cover"
            alt="Captured"
          />
        )}
      </div>

      <div className={`mt-6 w-full max-w-md px-4 py-3 rounded-xl text-center font-medium transition-colors ${
        status.type === 'error' ? 'bg-red-900/50 text-red-200 border border-red-800' :
        status.type === 'warning' ? 'bg-yellow-900/50 text-yellow-200 border border-yellow-800' :
        status.type === 'ready' ? 'bg-green-900/50 text-green-200 border border-green-800' :
        status.type === 'capturing' ? 'bg-blue-900/50 text-blue-200 border border-blue-800' :
        'bg-gray-800 text-gray-400 border border-gray-700'
      }`}>
        {status.text}
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center max-w-md italic">
        {gpsData.error ? (
          <span className="text-red-400">⚠️ {gpsData.error}</span>
        ) : (
          <span>📍 {gpsData.status}</span>
        )}
      </div>

      {capturedImage && (
        <div className="mt-8 flex gap-4 w-full max-w-md">
          <button 
            onClick={handleRetake}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl border border-gray-600 transition-colors"
          >
            Chụp lại
          </button>
          <button 
            onClick={handleUpload}
            disabled={isUploading || !gpsData.coords}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang gửi...
              </>
            ) : "Gửi điểm danh"}
          </button>
        </div>
      )}

      <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-xs text-gray-400 max-w-md">
        <p className="font-bold mb-1">Hướng dẫn:</p>
        <ul className="list-disc ml-4 space-y-1">
            <li>Vui lòng cho phép quyền truy cập Camera và Vị trí (GPS).</li>
            <li>Giữ điện thoại thẳng mặt, nơi có đủ ánh sáng.</li>
            <li>Hệ thống sẽ tự động chụp khi ảnh đạt yêu cầu và ổn định trong 1 giây.</li>
            <li>Sau khi chụp, nhấn nút "Gửi điểm danh" để hoàn tất.</li>
        </ul>
      </div>

      <canvas ref={captureCanvasRef} className="hidden" />
    </div>
  );
}
