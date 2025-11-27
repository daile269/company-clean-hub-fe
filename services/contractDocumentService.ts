import { ContractDocument } from "@/types";
import { apiService } from "./api";

const contractDocumentService = {
  async uploadDocuments(
    contractId: string | number,
    formData: FormData
  ): Promise<ContractDocument[]> {
    const response = await apiService.postFormData<ContractDocument[]>(
      `/contracts/${contractId}/documents`,
      formData
    );
    return response.data;
  },

  async getContractDocuments(contractId: string | number): Promise<ContractDocument[]> {
    const response = await apiService.get<ContractDocument[]>(
      `/contracts/${contractId}/documents`
    );
    return response.data;
  },

  async deleteDocument(
    contractId: string | number,
    documentId: string | number
  ): Promise<void> {
    await apiService.delete<void>(
      `/contracts/${contractId}/documents/${documentId}`
    );
  },

  buildCloudinaryUrl(publicId: string): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dcewns7zp";
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
  },

  getCloudinaryCloudName(): string {
    return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dr7yjnez9";
  },
};

export default contractDocumentService;
