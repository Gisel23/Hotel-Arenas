import {createPool} from 'mysql2/promise';

// Crear un pool de conexiones
const pool = createPool({
  host: 'bd6ciq2mbrmfn7krmuvs-mysql.services.clever-cloud.com',
  user: 'uvflk2zxvd3lknwn',
  password: '8p3QH6f33h275HLuRsHx',
  database: 'bd6ciq2mbrmfn7krmuvs',
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