'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  type: string
  image_url?: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch products:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-purple-500/20 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Atlas Produits
          </h1>
          <div className="space-x-4">
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
            >
              Dashboard Admin
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Bienvenue sur ta Usine à Produits
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Crée, vends et gère tes produits digitaux depuis n'importe où.
        </p>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {error ? (
          <div className="text-center bg-red-900/30 border border-red-500 p-6 rounded-lg">
            <p className="text-red-300 mb-2">Erreur lors du chargement des produits</p>
            <p className="text-gray-400 text-sm">{error}</p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
            >
              Aller au Dashboard
            </Link>
          </div>
        ) : loading ? (
          <div className="text-center text-gray-400">Chargement des produits...</div>
        ) : products.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-400 mb-4">Aucun produit pour l'instant.</p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
            >
              Créer le premier produit
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-gray-900/50 border border-purple-500/20 rounded-lg overflow-hidden hover:border-purple-500/50 transition"
              >
                {product.image_url && (
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{product.name}</h3>
                    <span className="text-xs bg-purple-600 px-2 py-1 rounded">
                      {product.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-purple-400">
                      ${product.price}
                    </span>
                    <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold transition">
                      Acheter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 mt-20 py-8 text-center text-gray-400">
        <p>© 2024 Atlas Produits - Construire ton empire digital</p>
      </footer>
    </div>
  )
}
