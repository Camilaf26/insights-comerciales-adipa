import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Insights Comerciales · ADIPA',
  description: 'Extrae objeciones, requerimientos y vocabulario de tus reuniones comerciales con IA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${poppins.className} bg-adipa-light min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
