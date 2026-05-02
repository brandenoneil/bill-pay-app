import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bill Pay Assistant',
  description: 'Scan paper bills, extract details, pay with one click',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
