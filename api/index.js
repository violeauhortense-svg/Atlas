module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Atlas - Test</title>
        <style>
          body { background: #1e1b4b; color: white; font-family: system-ui; padding: 2rem; }
          h1 { color: #a78bfa; }
        </style>
      </head>
      <body>
        <h1>✅ Atlas Produits est en ligne !</h1>
        <p>Le serveur fonctionne correctement.</p>
        <p><a href="/dashboard" style="color: #a78bfa;">Aller au dashboard</a></p>
      </body>
    </html>
  `)
}
