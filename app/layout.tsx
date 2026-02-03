import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ShotAI - AI投篮动作分析',
  description: '使用AI技术科学分析您的投篮动作，提供9维度专业评估和个性化训练建议',
  keywords: ['篮球', '投篮', 'AI分析', '运动科学', '训练'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}
