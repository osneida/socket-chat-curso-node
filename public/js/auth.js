
        const miFormulario = document.querySelector('form');

        const url = ( window.location.hostname.includes('localhost') )
                    ? 'http://localhost:8080/api/auth/'
                    : 'https://osneida-chat-nodejs.herokuapp.com/api/auth/';

                    
        miFormulario.addEventListener('submit', ev => {
            ev.preventDefault(); //evitar hacer un refresh de la pagina

            const formData = {};

            for( let el of miFormulario.elements) { //leo los elementos del formulario del index.html
                if( el.name.length > 0) 
                    formData[el.name]=el.value //reogo el nombre y el valor de los textos
            }

            fetch( url + 'login', { //le concateno login porque es la url
                method: 'POST',
                body: JSON.stringify( formData ),
                headers: { 'Content-Type': 'application/json' }
            })
            .then( resp => resp.json() ) //una promesa
            .then( ({ msg, token }) => { //otra promesa
                if ( msg ){  //pregunto por msg, si tiene algo es porque hay un error
                    return console.error( msg );
                }
                localStorage.setItem('token', token); //guardo el token en local Storage
                window.location = 'chat.html';
            })
            .catch( err => {
                console.log(err)
            })
        });

        function onSignIn(googleUser) {
   
            var id_token = googleUser.getAuthResponse().id_token;
            const data = { id_token };

            fetch( url + 'google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify( data )
            })
            .then( resp => resp.json() )
            .then( ({ token }) => {
                localStorage.setItem('token', token);
                window.location = 'chat.html';
            })
            .catch( console.log );
            
        }

        function signOut() {
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
            console.log('User signed out.');
            });
        }