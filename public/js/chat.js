const url = ( window.location.hostname.includes('localhost') )
                    ? 'http://localhost:8080/api/auth/'
                    : 'https://osneida-chat-nodejs.herokuapp.com/api/auth/';

let usuario = null;
let socket  = null;

//referencia HTM
const txtUid     = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir   = document.querySelector('#btnSalir');

//validar el token localstoreage
const validarJWT = async() => {
    
    let htmUsuario ='';

    const token = localStorage.getItem('token') || '';
    if( token.length <= 10) {
        window.location = 'index.html';  //redirecciono si el token no existe
        throw new Error('No hay token en el servidor');
    }
    const resp = await fetch( url, {
        headers: { 'x-token': token }
    });

    const { usuario: userDB, token: tokenDB } = await resp.json(); //esto es para renombrar usuario: userDB, token: tokenDB
    localStorage.setItem('token', tokenDB); //para actualizar el token
    usuario = userDB; //coloco los datos del usuario en la variable
    
    document.title = usuario.nombre;
    const usuarioOnline = document.querySelector('#usuarioOnline')
    
    const imagen = "./assets/images/users/no-image.jpg"
   // (usuario.img !=='') ? imagen = usuario.img : '';

    htmUsuario = `
    <li class="list-group">
        <p>
            <a data-id=${ usuario.uid } href="javascript:void(0)"><img src="${ usuario.img }" alt="user-img" class="img-fluid img-circle" width="40" height="40"> <span>${ usuario.nombre } <small class="text-success"></small></span></a>
        </p>
    </li>
    `;

    usuarioOnline.innerHTML= htmUsuario;


    await conectarSocket();
}


const conectarSocket = async() => {
    
    socket = io({  //manda el jwt json web token  bac //lo llama socket-controller
        'extraHeaders': {  //mando otros headers 
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect', () =>{
        console.log('Sockets online')
    });

    socket.on('disconnect', () =>{
        console.log('Sockets offline')
    });

  socket.on('recibir-mensajes', dibujarMensajes );
  socket.on('usuarios-activos', dibujarUsuarios );
 // socket.on('mensaje-privado',  dibujarMensajesPrivado );
 // socket.on('usuarios-activos', ( payload ) =>{
  //    console.log( payload);
//  });

    socket.on('mensaje-privado', ( payload ) => {
        console.log('Privado:', payload )
    });
}

const dibujarUsuarios = ( usuarios = []) =>{

    let usersHtml = '';
    usuarios.forEach( ({ nombre, uid, img="./assets/images/users/no-image.jpg" }) => {
        if (usuario.nombre !== nombre) {
        usersHtml += `
            <li class="list-group">
                <p>
                    <a data-id=${ uid } href="javascript:void(0)"><img src="${ img }" alt="user-img" class="img-fluid img-circle" width="40" height="40"> <span>${ nombre } <small class="text-success"></small></span></a>
                </p>
            </li>
            `;
        }
    })

    ulUsuarios.innerHTML = usersHtml;
}

const dibujarMensajes = ( mensajes = []) =>{
    let mensajesHtml = '';
    mensajes.forEach( ({ nombre, mensaje }) => {

        if (usuario.nombre == nombre) {
            mensajesHtml += `
            <li class="reverse right" style="text-align: right;">
                <div class="chat-content">
                    <h6  class="bg-light-inverse"> ${ mensaje }</h6>
                </div>
            
            </li> `;

        } else {

            servidor = (nombre=='servidor') ? 'servidor' : ' ';
            mensajesHtml += `
            <li class="otrosUsuarios bg-light-left">
            <div class="chat-content">
                
                <div class="box">${ nombre }</div>
                <h6 class="${ servidor }">${ mensaje }</h6>
            </div>
        
            </li>`;

        } 

    })

    ulMensajes.innerHTML = mensajesHtml;
}

txtMensaje.addEventListener('keyup', ({ keyCode }) => {
    
    const mensaje = txtMensaje.value.trim();
    const uid     = txtUid.value;
 
    if( keyCode !== 13 ){ return; }
    if( mensaje.length === 0 ){ return; }

    socket.emit('enviar-mensaje', { mensaje, uid });

    txtMensaje.value = '';

});


btnSalir.addEventListener('click', ()=> {

    localStorage.removeItem('token');

    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then( () => {
        console.log('User signed out.');
        window.location = 'index.html';
    });
});


const main = async() => {

    //valider jwt
    await validarJWT();
}

(()=>{
    gapi.load('auth2', () => {
        gapi.auth2.init();
        main();
    });
})();

// Listeners

ulUsuarios.addEventListener('click', ( ev ) => {
    txtUid.value='';
    const todoElemento   = ev.target.parentElement;  
    const id = todoElemento.getAttribute('data-id');
    if (id) {
        txtUid.value=id;
    }
});
