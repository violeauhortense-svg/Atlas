'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Dashboard } from '@/types'

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        const data = await response.json()
        setDashboard(data)
      } catch (error) {
        console.error('Failed to fetch dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="p-8 text-center">Chargement...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Mon Usine à Produits</h1>
          <Link
            href="/dashboard/new-product"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
          >
            + Nouveau Produit
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-700 p-6 rounded-lg">
            <div className="text-gray-400 text-sm">Revenu Total</div>
            <div className="text-3xl font-bold mt-2">
              ${dashboard?.total_revenue.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg">
            <div className="text-gray-400 text-sm">Commandes</div>
            <div className="text-3xl font-bold mt-2">
              {dashboard?.total_orders || 0}
            </div>
          </div>
          <div className="bg-gray-700 p-6 rounded-lg">
            <div className="text-gray-400 text-sm">Produits Actifs</div>
            <div className="text-3xl font-bold mt-2">
              {dashboard?.total_products || 0}
            </div>
          </div>
        </div>

        {/* Produits */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Mes Produits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboard?.products.map((product: any) => (
              <Link
                key={product.id}
                href={`/dashboard/product/${product.id}`}
                className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded mb-4"
                  />
                )}
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-400 font-bold">${product.price}</span>
                  <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                    {product.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Commandes Récentes */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Commandes Récentes</h2>
          <div className="bg-gray-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-600">
                <tr>
                  <th className="p-4 text-left">Client</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-right">Montant</th>
                  <th className="p-4 text-left">Statut</th>
                  <th className="p-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboard?.recent_orders.map((order: any) => (
                  <tr key={order.id} className="border-t border-gray-600">
                    <td className="p-4">{order.customer_name}</td>
                    <td className="p-4 text-gray-400">{order.customer_email}</td>
                    <td className="p-4 text-right font-bold">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'completed'
                            ? 'bg-green-600'
                            : order.status === 'pending'
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
