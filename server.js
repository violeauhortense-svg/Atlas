const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// API Routes
app.get('/api/products', (req, res) => {
  res.json([])
})

app.get('/api/dashboard', (req, res) => {
  res.json({
    total_revenue: 0,
    total_orders: 0,
    total_products: 0,
    recent_orders: [],
    products: []
  })
})

app.post('/api/products', (req, res) => {
  const { name, description, price, type, image_url } = req.body

  if (!name || !description || !price || !type) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  res.status(201).json({
    id: Date.now().toString(),
    name,
    description,
    price,
    type,
    image_url,
    created_at: new Date().toISOString()
  })
})

// Serve dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'))
})

// Catch-all - serve home
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
