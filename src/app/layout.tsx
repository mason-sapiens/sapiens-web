import type { Metadata } from 'next'
import { Crimson_Pro, Inter } from 'next/font/google'
import './globals.css'

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sapiens - AI Career Coach',
  description: 'Build portfolio projects that impress recruiters',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${crimsonPro.variable} ${inter.variable}`}>
      <body className="font-serif bg-ivory text-charcoal antialiased">
        {children}
      </body>
    </html>
  )
}
