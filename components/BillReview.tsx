'use client'

import { useState } from 'react'
import { CheckCircle2, ExternalLink, X, ShieldAlert, Edit2, Check } from 'lucide-react'
import { Bill, ExtractedBill } from '@/types/bill'
import { generateId } from '@/lib/storage'

interface Props {
  billData: { extractedData: ExtractedBill; imageDataUrl: string }
  onSave: (bill: Bill) => void
  onDiscard: () => void
}

interface EditableField {
  key: keyof ExtractedBill
  label: string
  isEditing: boolean
  value: string
}

export default function BillReview({ billData, onSave, onDiscard }: Props) {
  const { extractedData, imageDataUrl } = billData
  const [fields, setFields] = useState<Record<keyof ExtractedBill, string>>({
    billerName: extractedData.billerName,
    accountNumber: extractedData.accountNumber,
    amountDue: extractedData.amountDue,
    dueDate: extractedData.dueDate,
    paymentUrl: extractedData.paymentUrl,
    pinOrPasscode: extractedData.pinOrPasscode || '',
    additionalNotes: extractedData.additionalNotes || '',
    confidence: extractedData.confidence,
  })
  const [editingKey, setEditingKey] = useState<keyof ExtractedBill | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showImage, setShowImage] = useState(false)

  const startEdit = (key: keyof ExtractedBill) => {
    setEditingKey(key)
    setEditValue(fields[key])
  }

  const commitEdit = () => {
    if (editingKey) {
      setFields(prev => ({ ...prev, [editingKey]: editValue }))
    }
    setEditingKey(null)
  }

  const handleSave = () => {
    const bill: Bill = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      imageDataUrl,
      extractedData: fields as unknown as ExtractedBill,
    }
    onSave(bill)
  }

  const confidenceColor = {
    high: 'confidence-high',
    medium: 'confidence-medium',
    low: 'confidence-low',
  }[fields.confidence] || 'confidence-medium'

  const mainFields: { key: keyof ExtractedBill; label: string; sensitive?: boolean }[] = [
    { key: 'billerName', label: 'Biller' },
    { key: 'accountNumber', label: 'Account #', sensitive: true },
    { key: 'amountDue', label: 'Amount Due' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'pinOrPasscode', label: 'PIN / Code', sensitive: true },
    { key: 'paymentUrl', label: 'Payment URL' },
  ]

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Review Extraction
          </h2>
          <p className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Confidence:
            <span className={`font-medium ${confidenceColor}`}>
              {fields.confidence}
            </span>
            — edit any field if something looks off
          </p>
        </div>
        <button
          onClick={() => setShowImage(!showImage)}
          className="text-xs px-3 py-1.5 rounded"
          style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
        >
          {showImage ? 'Hide image' : 'View bill'}
        </button>
      </div>

      {/* Image preview */}
      {showImage && (
        <div className="mb-4 rounded-xl overflow-hidden animate-fade-up" style={{ border: '1px solid var(--border)', maxHeight: 300 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageDataUrl} alt="Scanned bill" className="w-full object-contain" style={{ maxHeight: 300 }} />
        </div>
      )}

      {/* Low confidence warning */}
      {fields.confidence === 'low' && (
        <div className="mb-4 p-3 rounded-lg flex items-center gap-3" style={{ background: 'rgba(181,98,62,0.08)', border: '1px solid rgba(181,98,62,0.2)' }}>
          <ShieldAlert size={16} style={{ color: 'var(--accent-rust)' }} />
          <p className="text-xs" style={{ color: '#7a3520', fontFamily: 'var(--font-mono)' }}>
            Low confidence — the image may be unclear. Please verify all fields carefully.
          </p>
        </div>
      )}

      {/* Fields */}
      <div className="bill-card rounded-xl overflow-hidden mb-4">
        {mainFields.map(({ key, label, sensitive }) => {
          const value = fields[key]
          const isEditing = editingKey === key
          const isEmpty = !value

          return (
            <div
              key={key}
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border-light)' }}
            >
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {label}
                </p>
                {isEditing ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={e => e.key === 'Enter' && commitEdit()}
                    className="w-full text-sm outline-none bg-transparent"
                    style={{
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      borderBottom: '1px solid var(--accent-moss)',
                      paddingBottom: 2
                    }}
                  />
                ) : key === 'paymentUrl' && value ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center gap-1 truncate"
                    style={{ color: 'var(--accent-moss)', fontFamily: 'var(--font-mono)' }}
                  >
                    <span className="truncate">{value}</span>
                    <ExternalLink size={11} className="flex-shrink-0" />
                  </a>
                ) : (
                  <p
                    className="text-sm truncate"
                    style={{
                      color: isEmpty ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontStyle: isEmpty ? 'italic' : 'normal'
                    }}
                  >
                    {isEmpty ? 'Not found' : sensitive && key === 'accountNumber' ? `••••${value.slice(-4)}` : value}
                  </p>
                )}
              </div>
              <button
                onClick={() => isEditing ? commitEdit() : startEdit(key)}
                className="flex-shrink-0 p-1.5 rounded"
                style={{ color: 'var(--text-muted)' }}
              >
                {isEditing ? <Check size={14} style={{ color: 'var(--accent-moss)' }} /> : <Edit2 size={13} />}
              </button>
            </div>
          )
        })}

        {fields.additionalNotes && (
          <div className="px-5 py-4">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Notes</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
              {fields.additionalNotes}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium btn-primary"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <CheckCircle2 size={16} />
          Save Bill
        </button>
        {fields.paymentUrl && (
          <a
            href={fields.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium btn-pay"
            style={{ fontFamily: 'var(--font-mono)', textDecoration: 'none' }}
            onClick={handleSave}
          >
            <ExternalLink size={16} />
            Pay Now
          </a>
        )}
        <button
          onClick={onDiscard}
          className="p-3 rounded-xl"
          style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
