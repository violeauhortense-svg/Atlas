module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'GET') {
    // Retourner une liste vide de produits pour l'instant
    res.status(200).json([])
  } else if (req.method === 'POST') {
    // Créer un nouveau produit
    const { name, description, price, type, image_url } = req.body

    if (!name || !description || !price || !type) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const product = {
      id: Date.now().toString(),
      name,
      description,
      price: parseFloat(price),
      type,
      image_url,
      created_at: new Date().toISOString()
    }

    res.status(201).json(product)
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
