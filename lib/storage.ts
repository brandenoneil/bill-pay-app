import { Bill } from '@/types/bill'

const STORAGE_KEY = 'bill-pay-assistant-bills'

export function getBills(): Bill[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveBill(bill: Bill): void {
  const bills = getBills()
  bills.unshift(bill)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills))
}

export function updateBillStatus(id: string, status: Bill['status']): void {
  const bills = getBills()
  const idx = bills.findIndex(b => b.id === id)
  if (idx !== -1) {
    bills[idx].status = status
    if (status === 'paid') bills[idx].paidAt = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills))
  }
}

export function deleteBill(id: string): void {
  const bills = getBills().filter(b => b.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills))
}

export function generateId(): string {
  return `bill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
