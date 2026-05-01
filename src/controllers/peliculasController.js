//const db = require('../data/peliculas')

// Asumiendo que 'db' es tu pool de conexión a PostgreSQL
const db = require('../config/db') 

const listarPeliculas = async (req, res, next) => {
  try {
    const { genero, buscar } = req.query;
    
    // 1. Base de la consulta con JOINs para traer nombres
    let query = `
      SELECT p.*, d.nombre AS director, g.nombre AS genero
      FROM peliculas p
      LEFT JOIN directores d ON p.director_id = d.id
      LEFT JOIN generos g ON p.genero_id = g.id
      WHERE 1=1
    `;
    
    const params = [];

    // 2. Filtro por slug de género
    if (genero) {
      params.push(genero);
      query += ` AND g.slug = $${params.length}`;
    }

    // 3. Búsqueda por texto (título o nombre del director)
    if (buscar) {
      params.push(`%${buscar}%`);
      query += ` AND (p.titulo ILIKE $${params.length} OR d.nombre ILIKE $${params.length})`;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

const obtenerPelicula = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const result = await db.query('SELECT * FROM peliculas WHERE id = $1', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Película no encontrada' })
    }
    res.json(result.rows[0])
  } catch (err) {
    next(err)
  }
}

const crearPelicula = async (req, res, next) => {
  try {
    const { titulo, director_id, anio, genero_id, nota } = req.body

    if (!titulo || !director_id || !anio || !genero_id) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes' })
    }

    const query = `
      INSERT INTO peliculas (titulo, director_id, anio, genero_id, nota)
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    
    const nueva = await db.query(query, [titulo, director_id, Number(anio), genero_id, nota])
    res.status(201).json(nueva.rows[0])
  } catch (err) {
    next(err)
  }
}

const actualizarPelicula = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const { titulo, director_id, anio, genero_id, nota } = req.body

    const query = `
      UPDATE peliculas 
      SET titulo = $1, director_id = $2, anio = $3, genero_id = $4, nota = $5
      WHERE id = $6 RETURNING *`;

    const actualizada = await db.query(query, [titulo, director_id, anio, genero_id, nota, id])

    if (actualizada.rows.length === 0) {
      return res.status(404).json({ error: 'Película no encontrada' })
    }
    res.json(actualizada.rows[0])
  } catch (err) {
    next(err)
  }
}

const eliminarPelicula = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const eliminada = await db.query('DELETE FROM peliculas WHERE id = $1 RETURNING *', [id])

    if (eliminada.rows.length === 0) {
      return res.status(404).json({ error: 'Película no encontrada' })
    }
    res.json({ mensaje: 'Película eliminada', pelicula: eliminada.rows[0] })
  } catch (err) {
    next(err)
  }
}

const obtenerEstadisticas = async (req, res, next) => {
  try {
    const stats = await db.query('SELECT COUNT(*) as total, AVG(nota) as media FROM peliculas')
    res.json(stats.rows[0])
  } catch (err) {
    next(err)
  }
}

const listarResenas = async (req, res, next) => {
  try {
    const peliculaId = Number(req.params.id)
    const resenas = await db.query('SELECT * FROM resenas WHERE pelicula_id = $1', [peliculaId])
    res.json(resenas.rows)
  } catch (err) {
    next(err)
  }
}

const crearResena = async (req, res, next) => {
  try {
    const peliculaId = Number(req.params.id)
    const { autor, texto, puntuacion } = req.body

    const nueva = await db.query(
      'INSERT INTO resenas (pelicula_id, autor, texto, puntuacion) VALUES ($1, $2, $3, $4) RETURNING *',
      [peliculaId, autor, texto, puntuacion]
    )
    res.status(201).json(nueva.rows[0])
  } catch (err) {
    next(err)
  }
}

module.exports = {
  listarPeliculas,
  obtenerPelicula,
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula,
  obtenerEstadisticas,
  listarResenas,
  crearResena
}