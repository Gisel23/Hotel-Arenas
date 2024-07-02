import {createPool} from 'mysql2/promise';

// Crear un pool de conexiones
const pool = createPool({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});


pool.getConnection()
    .then(connection => {
        pool.releaseConnection(connection);
        console.log('Base de datos conectada');
    })
    .catch(err=> console.error('Error connecting to database', err));

console.log(pool.getConnection())

console.log(pool)

export default pool;