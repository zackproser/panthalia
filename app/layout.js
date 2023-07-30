
import './globals.css'
import { Inter } from 'next/font/google'

import AuthProvider from './lib/auth/AuthProvider';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Panthalia',
  description: 'By Zachary Proser',
}

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <AuthProvider>
        <body className={inter.className}>{children}</body>
      </AuthProvider>
    </html>
  )
}
