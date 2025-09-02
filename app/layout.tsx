import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Definity Waste Tracker',
  description: 'Track Definity contrast waste and costs',
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
