import { apiService } from './api';

// Verification types matching backend DTOs
export interface VerificationImageResponse {
    id: number;
    verificationId: number;
    employeeId: number;
    attendanceId: number | null;
    cloudinaryPublicId: string;
    cloudinaryUrl: string;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
    capturedAt: string;
    faceConfidence: number | null;
    imageQualityScore: number | null;
    createdAt: string;
}

export interface AssignmentVerificationResponse {
    id: number;
    assignmentId: number;
    employeeId: number;
    employeeName: string;
    employeeCode: string;
    contractId: number;
    customerId: number | null;
    reason: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED' | 'BYPASS_APPROVED';
    maxAttempts: number;
    currentAttempts: number;
    approvedBy: string | null;
    approvedAt: string | null;
    autoApprovedAt: string | null;
    isCompleted: boolean;
    canCapture: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface VerificationCapturePayload {
    verificationId: number;
    imageData: string; // Base64 string
    attendanceId?: number;
    latitude?: number;
    longitude?: number;
    address?: string;
    faceConfidence?: number;
    imageQualityScore?: number;
}

// Lấy thông tin verification theo assignmentId
export const getVerificationByAssignment = async (
    assignmentId: number
): Promise<AssignmentVerificationResponse | null> => {
    try {
        const response = await apiService.get<AssignmentVerificationResponse>(
            `/verifications/assignment/${assignmentId}`
        );

        if (response.success && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Error fetching verification by assignment:', error);
        return null;
    }
};

// ⚠️ DEPRECATED — BE endpoint này đã bị vô hiệu hóa từ tháng 4/2026.
// BE trả lỗi: "Please use /api/work-schedules/capture endpoint for photo capture".
// → Dùng workScheduleService.capturePhoto({ workScheduleId, imageBase64, ... }) thay thế.
// → Luồng đúng xem tại: app/admin/attendance/capture/[id]/page.tsx (line 452)
export const captureVerificationImage = async (
    payload: VerificationCapturePayload
): Promise<VerificationImageResponse> => {
    try {
        const response = await apiService.post<VerificationImageResponse>(
            '/verifications/capture',
            payload
        );

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to capture verification image');
        }

        return response.data;
    } catch (error) {
        console.error('Error capturing verification image:', error);
        throw error;
    }
};

// Lấy danh sách ảnh theo verificationId
export const getVerificationImages = async (
    verificationId: number
): Promise<VerificationImageResponse[]> => {
    try {
        const response = await apiService.get<VerificationImageResponse[]>(
            `/verifications/${verificationId}/images`
        );

        if (response.success && response.data) {
            return Array.isArray(response.data) ? response.data : [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching verification images:', error);
        return [];
    }
};

// ⚠️ DEPRECATED — BE endpoint luôn return false từ tháng 4/2026.
// BE ghi chú: "This is deprecated with work_schedule. Use WorkScheduleService.canCapturePhoto() instead".
// → Dùng field `canCapture` từ response của getVerificationByAssignment(assignmentId) thay thế.
// → Luồng đúng xem tại: app/admin/attendance/capture/[id]/page.tsx (line 110)
export const canCaptureImage = async (verificationId: number): Promise<boolean> => {
    try {
        const response = await apiService.get<boolean>(
            `/verifications/${verificationId}/can-capture`
        );
        return response.success && response.data === true;
    } catch (error) {
        console.error('Error checking can capture:', error);
        return false;
    }
};

// Lấy ảnh xác minh theo attendanceId
export const getImageByAttendanceId = async (
    attendanceId: number
): Promise<VerificationImageResponse[]> => {
    try {
        const response = await apiService.get<VerificationImageResponse[]>(
            `/verifications/attendance/${attendanceId}/image`
        );

        if (response.success && response.data) {
            return Array.isArray(response.data) ? response.data : [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching image by attendance:', error);
        return [];
    }
};

// Customer: Lấy verifications của nhân viên làm việc theo hợp đồng của customer đang đăng nhập
export const getMyAssignmentVerifications = async (): Promise<AssignmentVerificationResponse[]> => {
    try {
        const response = await apiService.get<AssignmentVerificationResponse[]>(
            '/verifications/my-assignments'
        );

        if (response.success && response.data) {
            return Array.isArray(response.data) ? response.data : [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching my assignment verifications:', error);
        return [];
    }
};

// Lấy danh sách verification đang chờ duyệt
export const getPendingVerifications = async (): Promise<AssignmentVerificationResponse[]> => {
    try {
        const response = await apiService.get<AssignmentVerificationResponse[]>(
            '/verifications/pending'
        );

        if (response.success && response.data) {
            return Array.isArray(response.data) ? response.data : [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching pending verifications:', error);
        return [];
    }
};

// Duyệt verification
export const approveVerification = async (verificationId: number, disableVerification?: boolean): Promise<AssignmentVerificationResponse> => {
    try {
        const response = await apiService.put<AssignmentVerificationResponse>(
            '/verifications/approve',
            { 
                verificationId,
                disableVerification: disableVerification ?? false
            }
        );

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to approve verification');
        }

        return response.data;
    } catch (error) {
        console.error('Error approving verification:', error);
        throw error;
    }
};

// Từ chối verification
export const rejectVerification = async (
    verificationId: number, 
    reason?: string
): Promise<AssignmentVerificationResponse> => {
    try {
        const response = await apiService.put<AssignmentVerificationResponse>(
            `/verifications/${verificationId}/reject`,
            reason || ''
        );

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to reject verification');
        }

        return response.data;
    } catch (error) {
        console.error('Error rejecting verification:', error);
        throw error;
    }
};

// Duyệt bỏ qua xác minh (không cần đủ ảnh)
export const bypassApproveVerification = async (
    verificationId: number,
    notes?: string
): Promise<AssignmentVerificationResponse> => {
    try {
        const response = await apiService.put<AssignmentVerificationResponse>(
            `/verifications/${verificationId}/bypass-approve`,
            notes || ''
        );

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Failed to bypass approve verification');
        }

        return response.data;
    } catch (error) {
        console.error('Error bypass approving verification:', error);
        throw error;
    }
};

const verificationService = {
    getVerificationByAssignment,
    captureVerificationImage,
    getVerificationImages,
    canCaptureImage,
    getImageByAttendanceId,
    getMyAssignmentVerifications,
    getPendingVerifications,
    approveVerification,
    rejectVerification,
    bypassApproveVerification,
};

export default verificationService;
