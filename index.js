require('dotenv').config()
const express = require('express')
const peliculasController = require('./src/controllers/peliculasController')

const app = express()
const PORT = process.env.PORT || 3000

// 1. Conexión a la DB
require('./src/config/db')

// 2. Middlewares globales
app.use(express.json())

// 3. Rutas
const peliculasRouter = require('./src/routes/peliculas')
app.use('/api/peliculas', peliculasRouter)

// Ruta de estadísticas
app.get('/api/estadisticas', peliculasController.obtenerEstadisticas)

// 4. Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.url} no encontrada` })
})

// 5. MIDDLEWARE DE ERRORES CENTRALIZADO (Solo uno, y al final)
app.use((err, req, res, next) => {
  console.error('--- ERROR EN EL SERVIDOR ---')
  console.error(err.stack) // Esto te ayuda a ti a debuguear en la consola
  
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    error: 'Algo salió mal en el servidor',
    message: err.message, // Esto le dice al cliente qué ha fallado (útil en desarrollo)
    detalles: 'Revisa la consola del servidor para más información'
  })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})