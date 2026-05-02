export type BillStatus = 'pending' | 'paid' | 'skipped'

export interface ExtractedBill {
  billerName: string
  accountNumber: string
  amountDue: string
  dueDate: string
  paymentUrl: string
  pinOrPasscode?: string
  additionalNotes?: string
  confidence: 'high' | 'medium' | 'low'
}

export interface Bill {
  id: string
  extractedData: ExtractedBill
  status: BillStatus
  imageDataUrl: string
  createdAt: string
  paidAt?: string
}
