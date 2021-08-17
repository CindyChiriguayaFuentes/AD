const admin = require('firebase-admin');

const express = require('express')
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(express.urlencoded());

app.use(cors({origin : true}));

var permisos = require('./functions/permisos.json');
const { runInNewContext } = require('vm');

admin.initializeApp({
    credential : admin.credential.cert(permisos),
    databaseURL : 'https://ug2021-c1.firebaseio.com'
});

const db = admin.firestore();


function salida(codigo, entrada) {
    var today = new Date();
    var date = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDay();

    if (codigo == '200') return {
        mensaje : "Operación correcta",
        fecha : date,
        resultado : entrada
    }

    if (codigo=='500') return {
        mensaje : "Ocurrió un error",
        fecha : date,
        resultado : entrada
    }
}

app.get ("/api/contactos", async (req, res) => {
    try {
        let coleccion = db.collection('ad-contactos');
        const consulta = await coleccion.get();
        let docs = consulta.docs;

        const response = docs.map((doc) =>({
            id : doc.id,
            nombre : doc.data().nombre,
            apellido : doc.data().apellido,
            email : doc.data().email,
            rol : doc.data().rol
        }));
        res.status(200).json(salida("200",response));

    } catch (error) {
        return res.status(500).json(salida("500",error));
    }
});

app.post('/api/contactos', (req,res) => {
    (async () => {
        try {
            await db.collection('ad-contactos').doc('/' + req.body.id + '/')
                .create({
                        nombre : req.body.nombre,
                        apellido : req.body.apellido,
                        rol : req.body.rol,
                        email : req.body.email,
                        cel : req.body.cel});
            return res.status(200).send(salida("200","Contacto creado correctamente"));
        } catch (error) {
            console.log(error);
            return res.status(500).json(salida("500",error));
        }
    })();
});

app.put('/api/contactos/:contacto_id', async(req,res) => {
    try{
        const documento = db.collection('ad-contactos').doc(req.params.contacto_id);

        await documento.update ({            
            nombre : req.body.nombre,
            apellido : req.body.apellido,
            rol : req.body.rol,
            email : req.body.email,
            cel : req.body.cel
        });
        res.status(200).json(salida("200","Contacto actualizado"))
    } catch (error) {
        console.log(error);
        return res.status(500).json(salida("500",error));
    }
});


app.delete('/api/contactos/:contacto_id',async (req,res) => {
    try {
        const documento = db.collection('ad-contactos').doc(req.params.contacto_id);
        await documento.delete();
        return res.status(200).json(salida("200","Contacto eliminado"))
    } catch (error) {
        console.log(error);
        return res.status(500).json(salida("500",error));
    }
} );

app.listen(8002, () => {
    console.log('El servidor está inicializado en el puerto 8002')
});

