import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Atlas Produits - Plateforme de Produits Digitaux',
  description: 'Crée et vends tes produits digitaux depuis n\'importe où',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-white">{children}</body>
    </html>
  )
}
