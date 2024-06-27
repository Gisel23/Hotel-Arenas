import express from 'express';
import pool from './config/db.js';

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('¡Hola desde Express!');
});

app.post('/', (req, res) => {
    res.send('¡Hola desde Express!');
});

app.delete('/', (req, res) => {
    res.send('¡Hola desde Express!');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});