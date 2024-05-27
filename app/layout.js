import { Inter } from 'next/font/google'
import './globals.scss'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'WeTrack',
  description: 'WeTrack adalah sebuah platform manajemen tugas kolaboratif dan inovatif yang membantu Anda mempercepat proses pengerjaan tugas dengan efisiensi dan presisi, melalui integrasi dengan peralatan AI terkini untuk meningkatkan produktivitas dalam pengerjaan tugas Anda.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_LOGIN_DOMAIN)
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
