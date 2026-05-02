'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Camera, Loader2, AlertCircle, ImageIcon } from 'lucide-react'
import { ExtractedBill } from '@/types/bill'

interface Props {
  onExtracted: (data: { extractedData: ExtractedBill; imageDataUrl: string }) => void
}

export default function BillUploader({ onExtracted }: Props) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, HEIC, etc.)')
      return
    }

    setError(null)
    setLoading(true)

    // Create preview
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)

      // Extract base64
      const base64 = dataUrl.split(',')[1]
      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

      try {
        const res = await fetch('/api/extract-bill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        })

        const json = await res.json()

        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Extraction failed')
        }

        onExtracted({ extractedData: json.data, imageDataUrl: dataUrl })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to extract bill data')
        setLoading(false)
        setPreview(null)
      }
    }
    reader.readAsDataURL(file)
  }, [onExtracted])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  return (
    <div className="animate-fade-up">
      {/* Hero copy */}
      <div className="mb-8">
        <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Scan a bill.
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', lineHeight: '1.6' }}>
          Photograph or upload a paper bill. We'll extract the account number,<br />
          amount due, and payment link — then you confirm and pay.
        </p>
      </div>

      {/* Upload zone */}
      {!loading && (
        <div
          className={`upload-zone rounded-xl p-12 text-center cursor-pointer ${dragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'var(--border-light)' }}>
              <Upload size={24} style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                Drop bill image here or click to upload
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                JPG, PNG, HEIC, WEBP supported
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs btn-primary"
                style={{ fontFamily: 'var(--font-mono)' }}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
              >
                <Camera size={14} />
                Take Photo
              </button>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs"
                style={{
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  background: 'transparent'
                }}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
              >
                <ImageIcon size={14} />
                Browse Files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="rounded-xl p-12 text-center animate-fade-up" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          {preview && (
            <div className="mb-6 mx-auto w-40 h-52 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Bill preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={24} className="spinner" style={{ color: 'var(--accent-moss)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Reading your bill...
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Extracting account number, amount, and payment details
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-4 p-4 rounded-lg flex items-start gap-3 animate-fade-up" style={{ background: 'rgba(181,98,62,0.08)', border: '1px solid rgba(181,98,62,0.25)' }}>
          <AlertCircle size={16} style={{ color: 'var(--accent-rust)', marginTop: 1 }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#7a3520', fontFamily: 'var(--font-mono)' }}>
              Extraction failed
            </p>
            <p className="text-xs mt-1" style={{ color: '#9a5030' }}>{error}</p>
            <button
              onClick={() => { setError(null); setPreview(null) }}
              className="text-xs mt-2 underline"
              style={{ color: 'var(--accent-rust)' }}
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { tip: 'Good lighting', note: 'Avoid shadows over the text' },
          { tip: 'Full bill', note: 'Include the entire document' },
          { tip: 'Flat surface', note: 'Minimize distortion' },
        ].map(({ tip, note }) => (
          <div key={tip} className="p-3 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{tip}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
