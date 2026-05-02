'use client'

import { useState, useEffect } from 'react'
import { FileText, Clock, Receipt } from 'lucide-react'
import BillUploader from '@/components/BillUploader'
import BillReview from '@/components/BillReview'
import BillHistory from '@/components/BillHistory'
import { Bill } from '@/types/bill'
import { getBills, saveBill, updateBillStatus, deleteBill } from '@/lib/storage'

type Stage = 'upload' | 'review'
type Tab = 'scan' | 'history'

export default function Home() {
  const [tab, setTab] = useState<Tab>('scan')
  const [stage, setStage] = useState<Stage>('upload')
  const [pendingBill, setPendingBill] = useState<Omit<Bill, 'id' | 'createdAt' | 'status'> | null>(null)
  const [bills, setBills] = useState<Bill[]>([])

  useEffect(() => {
    setBills(getBills())
  }, [])

  const handleExtracted = (data: Omit<Bill, 'id' | 'createdAt' | 'status'>) => {
    setPendingBill(data)
    setStage('review')
  }

  const handleSave = (bill: Bill) => {
    saveBill(bill)
    setBills(getBills())
    setPendingBill(null)
    setStage('upload')
    setTab('history')
  }

  const handleDiscard = () => {
    setPendingBill(null)
    setStage('upload')
  }

  const handleMarkPaid = (id: string) => {
    updateBillStatus(id, 'paid')
    setBills(getBills())
  }

  const handleMarkSkipped = (id: string) => {
    updateBillStatus(id, 'skipped')
    setBills(getBills())
  }

  const handleDelete = (id: string) => {
    deleteBill(id)
    setBills(getBills())
  }

  const pendingCount = bills.filter(b => b.status === 'pending').length

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'var(--text-primary)' }}>
              <Receipt size={16} color="var(--bg-primary)" />
            </div>
            <div>
              <h1 className="text-base font-medium leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Bill Pay
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Assistant
              </p>
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full status-pending">
              <Clock size={12} />
              <span>{pendingCount} pending</span>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
        <div className="max-w-2xl mx-auto px-6 flex gap-6">
          <button
            onClick={() => { setTab('scan'); setStage('upload') }}
            className={`py-3 text-sm font-medium transition-colors ${tab === 'scan' ? 'tab-active' : 'tab-inactive'}`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span className="flex items-center gap-2">
              <FileText size={14} />
              Scan Bill
            </span>
          </button>
          <button
            onClick={() => setTab('history')}
            className={`py-3 text-sm font-medium transition-colors ${tab === 'history' ? 'tab-active' : 'tab-inactive'}`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span className="flex items-center gap-2">
              <Clock size={14} />
              History
              {bills.length > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--border-light)', color: 'var(--text-secondary)' }}>
                  {bills.length}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {tab === 'scan' && (
          <>
            {stage === 'upload' && (
              <BillUploader onExtracted={handleExtracted} />
            )}
            {stage === 'review' && pendingBill && (
              <BillReview
                billData={pendingBill}
                onSave={handleSave}
                onDiscard={handleDiscard}
              />
            )}
          </>
        )}
        {tab === 'history' && (
          <BillHistory
            bills={bills}
            onMarkPaid={handleMarkPaid}
            onMarkSkipped={handleMarkSkipped}
            onDelete={handleDelete}
          />
        )}
      </div>
    </main>
  )
}
