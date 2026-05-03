'use client'

import { useState } from 'react'
import { ExternalLink, CheckCircle, SkipForward, Trash2, ChevronDown, ChevronUp, ImageIcon } from 'lucide-react'
import { Bill } from '@/types/bill'

function normalizeUrl(url: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  return `https://${trimmed}`
}

interface Props {
  bills: Bill[]
  onMarkPaid: (id: string) => void
  onMarkSkipped: (id: string) => void
  onDelete: (id: string) => void
}

export default function BillHistory({ bills, onMarkPaid, onMarkSkipped, onDelete }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showImageId, setShowImageId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'skipped'>('all')

  const filtered = filter === 'all' ? bills : bills.filter(b => b.status === filter)

  const statusLabel = {
    pending: 'Pending',
    paid: 'Paid',
    skipped: 'Skipped',
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (bills.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-up">
        <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--border-light)' }}>
          <ImageIcon size={20} style={{ color: 'var(--text-muted)' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          No bills scanned yet
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Go to Scan Bill to add your first one
        </p>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(['pending', 'paid', 'skipped'] as const).map(status => {
          const count = bills.filter(b => b.status === status).length
          return (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? 'all' : status)}
              className="p-3 rounded-xl text-left transition-all"
              style={{
                border: `1px solid ${filter === status ? 'var(--text-primary)' : 'var(--border-light)'}`,
                background: filter === status ? 'var(--text-primary)' : 'var(--bg-card)',
              }}
            >
              <p className="text-lg font-medium" style={{
                fontFamily: 'var(--font-display)',
                color: filter === status ? 'var(--bg-primary)' : 'var(--text-primary)'
              }}>
                {count}
              </p>
              <p className="text-xs" style={{
                fontFamily: 'var(--font-mono)',
                color: filter === status ? 'rgba(244,243,240,0.7)' : 'var(--text-muted)'
              }}>
                {statusLabel[status]}
              </p>
            </button>
          )
        })}
      </div>

      {/* Bills list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            No {filter} bills
          </p>
        )}

        {filtered.map((bill) => {
          const isExpanded = expandedId === bill.id
          const isShowingImage = showImageId === bill.id

          return (
            <div key={bill.id} className="bill-card rounded-xl overflow-hidden">
              {/* Bill row */}
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium status-${bill.status}`}>
                        {statusLabel[bill.status]}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {formatDate(bill.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {bill.extractedData.billerName || 'Unknown Biller'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {bill.extractedData.amountDue && (
                        <span className="text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                          {bill.extractedData.amountDue}
                        </span>
                      )}
                      {bill.extractedData.dueDate && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          due {bill.extractedData.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : bill.id)}
                    className="p-1 flex-shrink-0"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border-light)' }}>
                  {/* Detail rows */}
                  {[
                    { label: 'Account #', value: bill.extractedData.accountNumber },
                    { label: 'PIN / Code', value: bill.extractedData.pinOrPasscode },
                    { label: 'Notes', value: bill.extractedData.additionalNotes },
                  ].filter(f => f.value).map(({ label, value }) => (
                    <div key={label} className="px-5 py-3 flex justify-between" style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{label}</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</span>
                    </div>
                  ))}

                  {/* Image toggle */}
                  {bill.imageDataUrl && (
                    <div style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <button
                        onClick={() => setShowImageId(isShowingImage ? null : bill.id)}
                        className="w-full px-5 py-3 text-left text-xs flex items-center gap-2"
                        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
                      >
                        <ImageIcon size={12} />
                        {isShowingImage ? 'Hide bill image' : 'Show bill image'}
                      </button>
                      {isShowingImage && (
                        <div className="px-5 pb-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={bill.imageDataUrl}
                            alt="Bill scan"
                            className="w-full rounded-lg object-contain"
                            style={{ maxHeight: 250, border: '1px solid var(--border)' }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-5 py-4 flex items-center gap-2 flex-wrap">
                    {bill.extractedData.paymentUrl && (
                      <a
                        href={normalizeUrl(bill.extractedData.paymentUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs btn-pay"
                        style={{ fontFamily: 'var(--font-mono)', textDecoration: 'none' }}
                      >
                        <ExternalLink size={12} />
                        Pay Now
                      </a>
                    )}
                    {bill.status !== 'paid' && (
                      <button
                        onClick={() => onMarkPaid(bill.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs"
                        style={{ border: '1px solid rgba(93,138,79,0.4)', color: 'var(--accent-moss)', fontFamily: 'var(--font-mono)' }}
                      >
                        <CheckCircle size={12} />
                        Mark Paid
                      </button>
                    )}
                    {bill.status === 'pending' && (
                      <button
                        onClick={() => onMarkSkipped(bill.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs"
                        style={{ border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                      >
                        <SkipForward size={12} />
                        Skip
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(bill.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs ml-auto"
                      style={{ color: 'var(--accent-rust)', fontFamily: 'var(--font-mono)' }}
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
