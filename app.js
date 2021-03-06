import express from 'express'
import cookieParser from 'cookie-parser'

import { crearAutenticatron } from './autenticatron.js'
import { crearDaoUsuarios } from './daoUsuarios.js'

const app = express()
const daoUsuarios = crearDaoUsuarios()
const autenticatron = crearAutenticatron(daoUsuarios)
const port = 4000


app.use(express.json())
app.use(cookieParser())

app.post('/login', autenticatron.login)
app.post('/refresh', autenticatron.refresh)

app.get('/', autenticatron.verify, (req, res) => {
    res.status(200).send('Bienvenido, usuario autorizado!!')
})

app.get('/unrecurso', autenticatron.verify, (req, res) => {
    res.status(200).send('Bienvenido, usuario autorizado!!')
})

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`)
})