export const crearDaoUsuarios = () => {
    
    let usuarios = {
        juan: {password: "passwordjuan"},
        maria: {password: "passwordmaria"},
        seba: {password: "passwordseba"},
        pepe: {password: "passwordpepe"}
    }

    return {
        buscarPorUsername: (username) => {
            if (!usuarios[username]) {
                return 'nombre de usuario no encontrado'
            } else {
                return usuarios[username]
            }                        
        },
    }
}