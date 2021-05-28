import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config({ path: 'variables.env' })

// Esto es provisorio, deberíamos utilizar el DAO correspondiente
// let users = {
//     juan: {password: "passwordjuan"},
//     maria: {password: "passwordmaria"},
//     seba: {password: "passwordseba"},
//     pepe: {password: "passwordpepe"}
// }

export const crearAutenticatron = (daoUsuarios) => {
    return {
        login: (req, res) => {
            let username = req.body.username
            let password = req.body.password
            
            // Esto también es provisorio
            if (!username || !password || daoUsuarios.buscarPorUsername(username).password !== password){
                return res.status(401).send('Error en la verificación de datos de usuario')
            }
    
            // Usamos el payload para almacenar información del usuario, nombre, rol, password, etc
            let payload = {username: username}
    
            // Creamos el accessToken con una vida útil corta
            let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
                algorithm: "HS256",
                expiresIn: process.env.ACCESS_TOKEN_LIFE
            })
    
            // Creamos el resfreshToken con una vida útil más larga
            let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
                algorithm: "HS256",
                expiresIn: process.env.REFRESH_TOKEN_LIFE
            })
    
            // Guardamos el refreshToken en el array de usuarios (debería usar el DAO)
            daoUsuarios.buscarPorUsername(username).refreshToken = refreshToken
    
            // Mandamos el accessToken al cliente dentro de una cookie
            res.cookie("jwt", accessToken, {secure: false, httpOnly: true})
            res.send('Usuario válido')
        },

        refresh: (req, res) => {
            let accessToken = req.cookies.jwt
    
            if (!accessToken){
                return res.status(403).send()
            }
    
            let payload
            try{
                payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
            }
            catch(e){
                return res.status(401).send("error al verificar accessToken " + e.message)
            }
    
            // Recuperamos el refreshToken del array de usuarios (debería usar el DAO)
            let refreshToken = daoUsuarios.buscarPorUsername(payload.username).refreshToken
    
            // Verificamos el refreshToken
            try{
                jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            }
            catch(e){
                return res.status(401).send("error al verificar el resfreshToken " + e.message)
            }
    
            let newToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, 
            {
                algorithm: "HS256",
                //expiresIn: process.env.ACCESS_TOKEN_LIFE
            })
    
            res.cookie("jwt", newToken, {secure: false, httpOnly: true})
            res.send("Resfresh Token enviado con éxito")
        },

        verify: (req, res, next) => {
            let accessToken = req.cookies.jwt
            // Si no hay Token en las cookies, el request no es autorizado
            if (!accessToken){
                return res.status(403).send("No se ha encontrado Token en las Cookies. Dónde está ese Token??")
            }
    
            let payload
            try{
                // usamos el método jwt.verify para verificar el access token
                // lanza un error si el token expiró o tiene una firma inválida
                payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
                next()
            }
            catch(e){
                // si hay un error retornamos un 401, request no autorizado
                return res.status(401).send(`Error en la verificación del token: ${e.message} `)
            }
        }
    }
    
}

