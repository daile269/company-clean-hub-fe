export class CameraService {
  private video: HTMLVideoElement;
  private stream: MediaStream | null = null;

  constructor(videoElement: HTMLVideoElement) {
    this.video = videoElement;
  }

  async start() {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      throw new Error('Trình duyệt không hỗ trợ MediaDevices');
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width:  { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });

    this.video.srcObject = this.stream;

    return new Promise<void>((resolve, reject) => {
      this.video.onloadedmetadata = () => {
        this.video.play()
          .then(() => resolve())
          .catch(reject);
      };
      this.video.onerror = (e) => reject(e);
    });
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.video.srcObject = null;
      this.stream = null;
    }
  }

  get dimensions() {
    return {
      width: this.video.videoWidth || 640,
      height: this.video.videoHeight || 480
    };
  }
}
