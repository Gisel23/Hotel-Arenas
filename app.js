import express, { json } from 'express';
import pool from './config/db.js';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);

const app = express();
const SECRET_KEY = process.env.SECRET_KEY;
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("Public"));
app.use(express.static("img"));


function verifyToken(req, res, next) {
  const token = req.cookies.token;
  console.log("req.cookies", req.cookies); 
  if (!token) {
    return res.status(403).send('Token requerido');
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("decoded", decoded); 
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verificando el token:', error); 
    res.status(401).send('Token no válido');
  }
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ username, role: 'admin' }, SECRET_KEY, { expiresIn: '10m' });
    console.log("Token: ", token); 
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      expires: new Date(Date.now() + 3600000)
    });
    res.redirect('/admin'); 
  } else {
    res.status(401).send('Credenciales no válidas');
  }
});

app.get('/admin', verifyToken, (req, res) => {
  console.log("req.user", req.user); 
  if (req.user.role === 'admin') {
    res.sendFile(__dirname + '/admin.html'); 
  } else {
    res.status(403).send('No tienes permisos para acceder a esta ruta');
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token').send('Hasta Luego');
});



app.get('/cliente', async (req, res) => {

  
  try {
    let query = req.query
    const connection = await pool.getConnection()
    const [rows] = await connection.query(`SELECT Cliente.id_cliente, Cliente.nombre, Cliente.direccion, Cliente.documento, Cliente.email,
      Nacionalidad.nacionalidad,  Habitacion.fecha_inicio_reserva, Habitacion.fecha_fin_reserva, Habitacion.numero_habitacion,
      TipoHabitacion.nombre AS Tipo_habitacion,
      Habitacion.costo AS CostoHabitacion
      FROM Cliente 
      JOIN Nacionalidad ON Cliente.fk_nacionalidad = Nacionalidad.id_nacionalidad
      JOIN Habitacion ON Cliente.fk_habitacion = Habitacion.id_habitacion 
      JOIN TipoHabitacion ON Habitacion.fk_tipohabitacion = TipoHabitacion.id_tipo`)
    connection.release()
    let filtrados = rows.filter((registro) => registro.rol === query.rol ) 
    console.log(filtrados)
    if (filtrados.length > 0) {
        res.json(filtrados) 
    } else {
        res.json(rows[0])

    }
  } catch (err) {
    console.error('Error de conexion a la base de datos', err)
    res.status(500).send('Internal server error')
  }
});



app.get('/cliente/:id', async (req, res) => {
  try {
    const id = req.params.id

    const connection = await pool.getConnection()
    const [rows] = await connection.query(
      `SELECT Cliente.nombre, Cliente.direccion, Cliente.documento, Cliente.email,
      Nacionalidad.nacionalidad,  Habitacion.fecha_inicio_reserva, Habitacion.fecha_fin_reserva, Habitacion.numero_habitacion,
      TipoHabitacion.nombre AS Tipo_habitacion,
      Habitacion.costo AS CostoHabitacion
      FROM Cliente 
      JOIN Nacionalidad ON Cliente.fk_nacionalidad = Nacionalidad.id_nacionalidad
      JOIN Habitacion ON Cliente.fk_habitacion = Habitacion.id_habitacion 
      JOIN TipoHabitacion ON Habitacion.fk_tipohabitacion = TipoHabitacion.id_tipo WHERE id_cliente = ?`,
      [id]
    )
    connection.release()
    if (rows.length === 0) {
      res.status(404).json({ mensaje: 'Cliente no encontrado' })
    } else {
        
       res.json(rows[0])

    }
  } catch (err) {
    console.error('Error de conexion a la base de datos', err)
    res.status(500).send('Internal server error');
  }
});


  app.post('/cliente', async (req, res) => {
    try {
      console.log('REQ.BODY -->', req.body)
      const { nombre, direccion, documento, email, fk_nacionalidad, fk_habitacion } = req.body
      const connection = await pool.getConnection()
      const [result] = await connection.query('INSERT INTO Cliente SET ?', [
        req.body
      ])
      connection.release()

      res.json({ id: result.insertId, nombre, direccion, documento, email, fk_nacionalidad, fk_habitacion })
    } catch (err) {
      console.error('Error de conexion a la base de datos', err)
      res.status(500).send('Internal server error')
    }
  })


app.put('/cliente/:id', async (req, res) => {
  const id = req.params.id;
  const cliente = req.body;

  const sql = 'UPDATE Cliente SET ? WHERE id_cliente = ?';

  try {
      const connection = await pool.getConnection()
      const [rows] = await connection.query(sql, [cliente, id]);
      connection.release();
      console.log(rows)
      res.send(`
        <h1>Cliente actualizado id: ${id}</h1>
    `);;
  } catch (error) {
      res.send(500).send('Internal server error')
  }

});
  
app.delete('/cliente/:id', async (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM Cliente WHERE id_cliente = ?';

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(sql, [id]);
    connection.release();
    console.log(result);

    if (result.affectedRows === 0) {
      return res.status(404).send('Cliente no encontrado');
    }

    res.send(`
      <h1>Cliente borrado id: ${id}</h1>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

  

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});