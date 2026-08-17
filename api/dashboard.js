const fs = require('fs')
const path = require('path')

module.exports = (req, res) => {
  const dashboardPath = path.join(__dirname, '../public/dashboard.html')

  try {
    const html = fs.readFileSync(dashboardPath, 'utf8')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.status(200).send(html)
  } catch (error) {
    console.error('Error reading dashboard:', error)
    res.status(404).send('Dashboard not found')
  }
}
