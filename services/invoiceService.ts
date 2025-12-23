import { apiService } from './api';

export interface InvoiceCreateRequest {
  contractId: number;
  invoiceMonth: number;
  invoiceYear: number;
  actualWorkingDays?: number;
  notes?: string;
}

export interface InvoiceUpdateRequest {
  status?: string;
  notes?: string;
}

export interface Invoice {
  id: number;
  contractId: number;
  contractNumber?: string;
  customerName?: string;
  invoiceNumber?: string;
  invoiceMonth: number;
  invoiceYear: number;
  totalAmount: number;
  status: string;
  actualWorkingDays?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceService = {
  // Create invoice
  create: async (data: InvoiceCreateRequest): Promise<Invoice> => {
    try {
      const response = await apiService.post<any>("/invoices", data);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create invoice');
      }

      const apiInvoice = response.data;
      return {
        id: apiInvoice.id,
        contractId: apiInvoice.contractId,
        contractNumber: apiInvoice.contractNumber,
        customerName: apiInvoice.customerName,
        invoiceNumber: apiInvoice.invoiceNumber,
        invoiceMonth: apiInvoice.invoiceMonth,
        invoiceYear: apiInvoice.invoiceYear,
        totalAmount: apiInvoice.totalAmount,
        status: apiInvoice.status,
        actualWorkingDays: apiInvoice.actualWorkingDays,
        notes: apiInvoice.notes,
        createdAt: new Date(apiInvoice.createdAt),
        updatedAt: new Date(apiInvoice.updatedAt),
      };
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  // Get invoice by ID (returns detailed invoice with invoiceLines)
  getById: async (id: number): Promise<any> => {
    try {
      const response = await apiService.get<any>(`/invoices/${id}`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch invoice');
      }

      const d = response.data;

      // Normalize API response to friendly shape for UI
      const invoice = {
        id: d.id,
        contractId: d.contractId,
        customerId: d.customerId,
        customerName: d.customerName,
        customerPhone: d.customerPhone,
        customerAddress: d.customerAddress,
        customerTaxCode: d.customerTaxCode,
        invoiceNumber: d.invoiceNumber,
        invoiceMonth: d.invoiceMonth,
        invoiceYear: d.invoiceYear,
        actualWorkingDays: d.actualWorkingDays,
        subtotal: Number(d.subtotal ?? d.baseAmount ?? 0),
        vatPercentage: d.vatPercentage ?? null,
        vatAmount: Number(d.vatAmount ?? 0),
        totalAmount: Number(d.totalAmount ?? d.total ?? 0),
        invoiceType: d.invoiceType,
        notes: d.notes,
        status: d.status,
        createdAt: d.createdAt ? new Date(d.createdAt) : null,
        paidAt: d.paidAt ? new Date(d.paidAt) : null,
        createdByUsername: d.createdByUsername,
        invoiceLines: Array.isArray(d.invoiceLines)
          ? d.invoiceLines.map((line: any) => ({
              id: line.id,
              serviceId: line.serviceId,
              title: line.title,
              description: line.description,
              serviceType: line.serviceType,
              unit: line.unit,
              quantity: line.quantity,
              price: Number(line.price ?? 0),
              baseAmount: Number(line.baseAmount ?? 0),
              vat: Number(line.vat ?? 0),
              vatAmount: Number(line.vatAmount ?? 0),
              totalAmount: Number(line.totalAmount ?? 0),
              contractDays: line.contractDays,
              actualDays: line.actualDays,
              effectiveFrom: line.effectiveFrom ? new Date(line.effectiveFrom) : null,
              createdAt: line.createdAt ? new Date(line.createdAt) : null,
            }))
          : [],
      };

      return invoice;
    } catch (error) {
      console.error('Error fetching invoice detail:', error);
      throw error;
    }
  },

  // Get invoices by contract
  getByContractId: async (contractId: number): Promise<Invoice[]> => {
    try {
      const response = await apiService.get<any>(`/invoices/contract/${contractId}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch invoices');
      }

      return response.data.map((apiInvoice: any) => ({
        id: apiInvoice.id,
        contractId: apiInvoice.contractId,
        contractNumber: apiInvoice.contractNumber,
        customerName: apiInvoice.customerName,
        invoiceNumber: apiInvoice.invoiceNumber,
        invoiceMonth: apiInvoice.invoiceMonth,
        invoiceYear: apiInvoice.invoiceYear,
        totalAmount: apiInvoice.totalAmount,
        status: apiInvoice.status,
        actualWorkingDays: apiInvoice.actualWorkingDays,
        notes: apiInvoice.notes,
        createdAt: new Date(apiInvoice.createdAt),
        updatedAt: new Date(apiInvoice.updatedAt),
      }));
    } catch (error) {
      console.error('Error fetching invoices by contract:', error);
      throw error;
    }
  },

  // Get invoices by customer
  getByCustomerId: async (customerId: number): Promise<Invoice[]> => {
    try {
      const response = await apiService.get<any>(`/invoices/customer/${customerId}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch invoices');
      }

      return response.data.map((apiInvoice: any) => ({
        id: apiInvoice.id,
        contractId: apiInvoice.contractId,
        contractNumber: apiInvoice.contractNumber,
        customerName: apiInvoice.customerName,
        invoiceNumber: apiInvoice.invoiceNumber,
        invoiceMonth: apiInvoice.invoiceMonth,
        invoiceYear: apiInvoice.invoiceYear,
        totalAmount: apiInvoice.totalAmount,
        status: apiInvoice.status,
        actualWorkingDays: apiInvoice.actualWorkingDays,
        notes: apiInvoice.notes,
        createdAt: new Date(apiInvoice.createdAt),
        updatedAt: new Date(apiInvoice.updatedAt),
      }));
    } catch (error) {
      console.error('Error fetching invoices by customer:', error);
      throw error;
    }
  },

  // Get invoices by status
  getByStatus: async (status: string): Promise<Invoice[]> => {
    try {
      const response = await apiService.get<any>(`/invoices/status/${status}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch invoices');
      }

      return response.data.map((apiInvoice: any) => ({
        id: apiInvoice.id,
        contractId: apiInvoice.contractId,
        contractNumber: apiInvoice.contractNumber,
        customerName: apiInvoice.customerName,
        invoiceNumber: apiInvoice.invoiceNumber,
        invoiceMonth: apiInvoice.invoiceMonth,
        invoiceYear: apiInvoice.invoiceYear,
        totalAmount: apiInvoice.totalAmount,
        status: apiInvoice.status,
        actualWorkingDays: apiInvoice.actualWorkingDays,
        notes: apiInvoice.notes,
        createdAt: new Date(apiInvoice.createdAt),
        updatedAt: new Date(apiInvoice.updatedAt),
      }));
    } catch (error) {
      console.error('Error fetching invoices by status:', error);
      throw error;
    }
  },

  // Get invoices by month/year
  getByMonthYear: async (month: number, year: number): Promise<Invoice[]> => {
    try {
      const response = await apiService.get<any>(`/invoices/month/${month}/year/${year}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch invoices');
      }

      return response.data.map((apiInvoice: any) => ({
        id: apiInvoice.id,
        contractId: apiInvoice.contractId,
        contractNumber: apiInvoice.contractNumber,
        customerName: apiInvoice.customerName,
        invoiceNumber: apiInvoice.invoiceNumber,
        invoiceMonth: apiInvoice.invoiceMonth,
        invoiceYear: apiInvoice.invoiceYear,
        totalAmount: apiInvoice.totalAmount,
        status: apiInvoice.status,
        actualWorkingDays: apiInvoice.actualWorkingDays,
        notes: apiInvoice.notes,
        createdAt: new Date(apiInvoice.createdAt),
        updatedAt: new Date(apiInvoice.updatedAt),
      }));
    } catch (error) {
      console.error('Error fetching invoices by month/year:', error);
      throw error;
    }
  },

  // Update invoice
  update: async (id: number, data: InvoiceUpdateRequest): Promise<Invoice> => {
    try {
      const response = await apiService.put<any>(`/invoices/${id}`, data);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update invoice');
      }

      const apiInvoice = response.data;
      return {
        id: apiInvoice.id,
        contractId: apiInvoice.contractId,
        contractNumber: apiInvoice.contractNumber,
        customerName: apiInvoice.customerName,
        invoiceNumber: apiInvoice.invoiceNumber,
        invoiceMonth: apiInvoice.invoiceMonth,
        invoiceYear: apiInvoice.invoiceYear,
        totalAmount: apiInvoice.totalAmount,
        status: apiInvoice.status,
        actualWorkingDays: apiInvoice.actualWorkingDays,
        notes: apiInvoice.notes,
        createdAt: new Date(apiInvoice.createdAt),
        updatedAt: new Date(apiInvoice.updatedAt),
      };
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  },

  // Delete invoice
  delete: async (id: number): Promise<void> => {
    try {
      const response = await apiService.delete<any>(`/invoices/${id}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  },

  // Export invoice as Excel (returns Blob)
  exportExcel: async (id: number): Promise<Blob> => {
    try {
      // apiService.getFile should return a Blob
      const blob = await apiService.getFile(`/invoices/${id}/export/excel`);
      return blob;
    } catch (error) {
      console.error('Error exporting invoice excel:', error);
      throw error;
    }
  },

  // Export all invoices for a given month/year as Excel (returns Blob)
  exportAllExcel: async (month: number, year: number): Promise<Blob> => {
    try {
      const blob = await apiService.getFile(`/invoices/month/${month}/year/${year}/export/excel`);
      return blob;
    } catch (error) {
      console.error('Error exporting all invoices excel:', error);
      throw error;
    }
  },
};

export default invoiceService;
