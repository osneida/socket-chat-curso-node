const { Socket } = require("socket.io");
const { comprobarJWT } = require("../helpers");
const { ChatMensajes } = require("../models");

const chatMensajes = new ChatMensajes();

const socketController = async( socket = new Socket(), io ) => { //io trae todos los datos de la persona que se acaba de conectar
    //TODO esta lineas las debo borrar porque puede causar error
    // = new Socket()
    


    //console.log('cliente connectado', socket.id );

   // console.log(socket);
   //  const token = socket.handshake.headers['x-token']; // extraijo el token personalizado x-token que envie en chat.js
   //ahora debo validar el token, esta funcion la coloco en genera-jwt.js
   const usuario = await comprobarJWT( socket.handshake.headers['x-token'] );
   if( !usuario ){
        return socket.disconnect(); // sino existe en BD lo desconecto
   }

   //agregar el usuario conectado
   chatMensajes.conectarUsuario( usuario );
   io.emit('usuarios-activos', chatMensajes.usuariosArr );
   socket.emit('recibir-mensajes', chatMensajes.ultimos10 ); //esto es para que el nuevo usuario vea también los últimos 10 mensajes enviados
   
   //conectado a una sala especia con el uid del usuario que tiene en base de datos
   socket.join( usuario.id )  //se conecta a tres salas //una global, socket.id, usuario.id

   console.log( 'se conectó ', usuario.nombre )
   mensaje='se conectó ' + usuario.nombre;
   chatMensajes.enviarMensaje( '', 'servidor', mensaje );

   //limpiar cuando el usuario se desconecta
   socket.on('disconnect', () =>{
        chatMensajes.desconectarUsuario( usuario.id );

        console.log( 'se desconectó ', usuario.nombre )

        mensaje='se desconectó ' + usuario.nombre;
        chatMensajes.enviarMensaje( '', 'servidor', mensaje );
        io.emit('usuarios-activos', chatMensajes.usuariosArr );
   });

   socket.on('enviar-mensaje', ({ uid, mensaje })=>{
      
        if ( uid ){  //es un mensaje privado
            //el mensaje va de la interfaz al servidor y el servidor ve a quien va
            socket.to( uid ).emit('mensaje-privado', { de: usuario.nombre, mensaje });
        }else { //es un mensaje para todos
            chatMensajes.enviarMensaje( usuario.id, usuario.nombre, mensaje );
            io.emit( 'recibir-mensajes', chatMensajes.ultimos10 );
        }
   })
   

}

module.exports = {
    socketController
}