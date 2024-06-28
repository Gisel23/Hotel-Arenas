import express from 'express';
import pool from './config/db.js';

const app = express();
const port = 3000;

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/Cliente', async (req, res) => {
    try {
      let query = req.query
      const connection = await pool.getConnection()
      const [rows] = await connection.query('SELECT * FROM Cliente')
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

  app.get('/Cliente/:id', async (req, res) => {
    try {
      const id = req.params.id
  
      const connection = await pool.getConnection()
      const [rows] = await connection.query(
        'SELECT * FROM Cliente WHERE id_cliente = ?',
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
      res.status(500).send('Internal server error')
    }
  });


  app.post('/Cliente', async (req, res) => {
    try {
      console.log('REQ.BODY -->', req.body)
      // Obtiene los valores del formulario
      const { nombre, direccion, documento, email, fk_nacionalidad, fk_habitacion } = req.body
      const connection = await pool.getConnection()
      // const [result] = await connection.query('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)', [nombre, email, password, rol]);
      const [result] = await connection.query('INSERT INTO Cliente SET ?', [
        req.body
      ])
      connection.release()
      res.json({ id: result.insertId, nombre, direccion, documento, email, fk_nacionalidad, fk_habitacion })
      // res.redirect('/' + "?mensaje=Usuario creado correctamente")
    } catch (err) {
      console.error('Error de conexion a la base de datos', err)
      res.status(500).send('Internal server error')
    }
  })

// Actualizar un usuario
app.put('/Cliente/:id', async (req, res) => {
  const id = req.params.id;
  const cliente = req.body;

  const sql = 'UPDATE Cliente SET ? WHERE id_cliente = ?';

  try {
      const connection = await pool.getConnection()
      const [rows] = await connection.query(sql, [cliente, id]);
      connection.release();
      console.log(rows)
      res.send(`
        <h1>Producto actualizado id: ${id}</h1>
    `);;
  } catch (error) {
      res.send(500).send('Internal server error')
  }

});
  
app.delete('/Cliente/:id', async (req, res) => {
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