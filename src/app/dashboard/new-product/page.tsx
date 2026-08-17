'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    type: 'generator',
    image_url: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
        }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        alert('Erreur lors de la création du produit')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-6 block">
          ← Retour
        </Link>

        <h1 className="text-3xl font-bold mb-8">Créer un Nouveau Produit</h1>

        <form onSubmit={handleSubmit} className="bg-gray-700 p-8 rounded-lg">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Nom du Produit</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full bg-gray-600 border border-gray-500 rounded px-4 py-2 text-white"
              placeholder="Ex: Générateur de Prompts IA"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              className="w-full bg-gray-600 border border-gray-500 rounded px-4 py-2 text-white h-24"
              placeholder="Décris ton produit..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Prix (USD)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="w-full bg-gray-600 border border-gray-500 rounded px-4 py-2 text-white"
                placeholder="29.99"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-4 py-2 text-white"
              >
                <option value="generator">Générateur</option>
                <option value="template">Template</option>
                <option value="calculator">Calculateur</option>
                <option value="checklist">Checklist</option>
                <option value="saas">SaaS</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">URL de l'image</label>
            <input
              type="url"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full bg-gray-600 border border-gray-500 rounded px-4 py-2 text-white"
              placeholder="https://..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg font-bold transition"
          >
            {loading ? 'Création...' : 'Créer le Produit'}
          </button>
        </form>
      </div>
    </div>
  )
}
