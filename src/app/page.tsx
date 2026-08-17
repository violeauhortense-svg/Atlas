import Link from 'next/link'

export default function Home() {
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
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
          >
            Accéder au Dashboard
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 border border-purple-500/20 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">📊 Gère tes Produits</h3>
            <p className="text-gray-400">Crée et gère tous tes produits digitaux depuis ton dashboard.</p>
          </div>
          <div className="bg-gray-900/50 border border-purple-500/20 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">💰 Paiements Automatiques</h3>
            <p className="text-gray-400">Stripe est intégré pour gérer les paiements en toute sécurité.</p>
          </div>
          <div className="bg-gray-900/50 border border-purple-500/20 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">📱 Mobile Friendly</h3>
            <p className="text-gray-400">Gère tout depuis ton téléphone, où que tu sois.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 mt-20 py-8 text-center text-gray-400">
        <p>© 2024 Atlas Produits - Construire ton empire digital</p>
      </footer>
    </div>
  )
}
