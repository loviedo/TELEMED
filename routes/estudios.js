var express = require('express');
var app = express()
var multer  = require('multer');
var path = require('path');
var nombre_archivo ="nofile";
var COD_EST = "nocod";
const fileUpload = require('express-fileupload');
PDFDocument = require('pdfkit');//para generar el pdf.

/*para el upload */
var http = require('http');
var formidable = require('formidable');
var fs = require('fs');

/*
Pantalla principal muestra los campos a completar y 2 inputs.
*/

/* FUNCIONES AUXILIARES */
function makeid() {
	var cod = "";
	var posible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
	for(var i = 0; i < 6; i++)
		cod += posible.charAt(Math.floor(Math.random() * posible.length));
	return cod;
}

/* GET de estudios, raiz */
app.get('/', function(req, res, next) {
  req.getConnection(function(err,connection){
	var query = connection.query('SELECT id,cod,ci,nombre,apellido,fec_estudio,tel, estado FROM estudio',function(err,rows)
	{
		if(err)
			var errornya  = ("Error : %s ",err );   
		req.flash('error', errornya);   
		res.render('estudios/listar',{title:"TELEMED",data:rows});
	});	
 });
});

/* llamamos desde /consultas/consultar */
app.get('/pagar', function(req, res, next) {
	req.getConnection(function(err,connection){
	//carmbiar la consulta, esta al pedo
		var query = connection.query('SELECT id,cod,ci,nombre,apellido,fec_estudio,tel, estado FROM estudio',function(err,rows)
		{
			if(err){
			var errornya  = ("Error : %s ",err );   
			req.flash('error', errornya);   }
			else{
				//mostramos la pagina
				
			}
		});	
   	});
});

/*GET DE COMPROBANTE DE ESTUDIO CARGADO // PAGINA: ESTUDIOS/CARGADO */
app.get('/final', function(req, res, next) {
	req.getConnection(function(err,connection){
	//carmbiar la consulta, esta al pedo
		var query = connection.query('SELECT id,cod,ci,nombre,apellido,fec_estudio,tel, estado FROM estudio',function(err,rows)
		{
			if(err){
			var errornya  = ("Error : %s ",err );   
			req.flash('error', errornya);   }

			//DESCARGAR PDF CON DATOS DEL ESTUDIO
			var file = path.resolve("./files/"+COD_EST+".pdf");
			res.contentType('Content-Type',"application/pdf");
			res.download(file, function (err) {
				if (err) {
					console.log("ERROR AL ENVIAR EL ARCHIVO:");
					console.log(err);
				} else {
					console.log("ARCHIVO ENVIADO!");
				}
			});
		});	
   	});
});

//socket para carga de archivo.
app.post('/upload', function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // 'filecito' el nombre del <input> de tipo 'file'
        var old_path = files.foo.path,
            file_size = files.foo.size,
            file_ext = files.foo.name.split('.').pop(),
            index = old_path.lastIndexOf('\\') + 1,
            file_name = old_path.substr(index),
            nuevo_file_name = files.foo.name.split('.').reverse().pop()//agregamos el nombre que tenia luego
            new_path = './files/'+ nuevo_file_name + '.' + file_ext;//cambiado por L.O.
            //new_path = path.join(process.env.PWD, '/files/', file_name + '.' + file_ext);
		
        fs.readFile(old_path, function(err, data) {
            fs.writeFile(new_path, data, function(err) {
                fs.unlink(old_path, function(err) {
                    if (err) {
                        res.status(500);
                        req.flash('error', 'ERROR AL CARGAR ARCHIVO!');
                        res.redirect('/estudios/add');
                    } else {
                        res.status(200);
                        req.flash('success', 'ARCHIVO CARGADO CORRECTAMENTE!');
						res.redirect('/estudios/add');
						nombre_archivo = nuevo_file_name + '.' + file_ext;
                    }
                });
            });
        });
    });
});


/* RUTEO PARA INSERTAR ESTUDIO */
app.post('/add', /*upload.single('foo'),*/ function(req, res, next) {
    //VALIDACIONES//
    /*
	req.assert('nombre', 'Favor Ingresar Nombre').notEmpty().isAlphanumeric();//validar nombre
	req.assert('apellido', 'Favor Ingresar Apellido').notEmpty().isAlphanumeric();//validar apellido
	req.assert('fec_estudio', 'Favor Ingresar FECHA con formato DD/MM/AAAA').notEmpty().toDate();//validar fecha estudio
	req.assert('tel', 'Favor Ingresar Telefono').notEmpty().isNumeric();//req telefono
    */
	//req.assert('tel', 'Favor Ingresar Telefono').notEmpty();//req telefono

	var errors = req.validationErrors();
	if (!errors) {
		v_costo = 0;//para el calculo de costo
		v_ci = req.sanitize('ci' ).escape().trim(); 
		v_nombre = req.sanitize('nombre' ).escape().trim();
		v_apellido = req.sanitize( 'apellido' ).escape().trim();
		v_fec_estudio = req.sanitize( 'fec_estudio' ).trim();
		v_tel= req.sanitize( 'tel' ).trim();
		v_edad = req.sanitize( 'edad' ).escape();
		v_sexo = req.sanitize( 'sexo' ).escape();
		//v_tip_estudio = req.sanitize( 'tip_estudio' ).escape();
		v_tomo = req.sanitize( 'tomo' ).escape();
		v_rayo = req.sanitize( 'rayo' ).escape();
		v_reso = req.sanitize( 'reso' ).escape();
		//
		v_contraste = req.sanitize( 'contraste' ).escape();
		v_craneo = req.sanitize( 'craneo' ).escape();
		v_cuello = req.sanitize( 'cuello' ).escape();
		v_torax = req.sanitize( 'torax' ).escape();
		v_abdomen = req.sanitize( 'abdomen' ).escape();
		v_pelvis = req.sanitize( 'pelvis' ).escape();
		v_hombro = req.sanitize( 'hombro' ).escape();
		v_brazo = req.sanitize( 'brazo' ).escape();
		v_codo = req.sanitize( 'codo' ).escape();
		v_ante = req.sanitize( 'ante' ).escape();
		v_muneca = req.sanitize( 'muneca' ).escape();
		v_mano = req.sanitize( 'mano' ).escape();
		v_cade = req.sanitize( 'cade' ).escape();
		v_muslo = req.sanitize( 'muslo' ).escape();
		v_rodilla = req.sanitize( 'rodilla' ).escape();
		v_pierna = req.sanitize( 'pierna' ).escape();
		v_tobillo = req.sanitize( 'tobillo' ).escape();
		v_pie = req.sanitize( 'pie' ).escape();
		v_urotac = req.sanitize( 'urotac' ).escape();
		v_completo = req.sanitize( 'completo' ).escape();
		v_med_sol = req.sanitize( 'med_sol' ).escape();
		v_nro_reg = 0//req.sanitize( 'nro_reg' ).escape();
		v_mot_est = req.sanitize( 'mot_est' ).escape();
		v_lugar_est = req.sanitize( 'lugar_est' ).escape();
		v_COD_EST = makeid();//cargamos el codigo del estudio
		v_estado ="EN ESPERA";//valor a insertar por defecto
		v_nomfile = nombre_archivo;//para guardar en la base de datos

		if(v_tomo){v_costo = v_costo + 50000;}
		if(v_rayo){v_costo = v_costo + 10000;}
		if(v_reso){v_costo = v_costo + 80000;}
		if(v_contraste==1){v_costo = v_costo + 30000;}

		
		var customer = {
			cod: v_COD_EST,
			ci: v_ci,
			nombre: v_nombre,
			apellido: v_apellido,
			fec_estudio : v_fec_estudio,
			tel : v_tel,
			edad : v_edad,
			sexo : v_sexo,
			tomo : v_tomo, 
			rayo : v_rayo, reso : v_reso,
			contraste : v_contraste,
			craneo : v_craneo,cuello : v_cuello,torax : v_torax,abdomen : v_abdomen, pelvis : v_pelvis,
			hombro : v_hombro,brazo : v_brazo,codo : v_codo,ante : v_ante,muneca : v_muneca,mano : v_mano,
			cade : v_cade,muslo : v_muslo,rodilla : v_rodilla,pierna : v_pierna,tobillo : v_tobillo,
			pie : v_pie,urotac : v_urotac,completo : v_completo,med_sol : v_med_sol, nro_reg : v_nro_reg,
			mot_est : v_mot_est,lugar_est : v_lugar_est, nomfile : v_nomfile, estado: v_estado //VALOR DE ESTADO INICIAL
			,costo: v_costo}

		var insert_sql = 'INSERT INTO estudio SET ?';
		req.getConnection(function(err,connection){
			var query = connection.query(insert_sql, customer, function(err, result){
				if(err)
				{
					var errors_detail  = ("Error Insert : %s ",err );   
					req.flash('error', errors_detail); 
					res.render('estudios/add', 
					{//MOSTRAMOS LOS VALORES
						cod: req.param('cod'),
						ci: req.param('ci'), 
						nombre: req.param('nombre'),
						apellido: req.param('apellido'),
						fec_estudio: req.param('fec_estudio'),
						tel: req.param('tel'),
						edad: req.param('edad'),
						sexo: req.param('sexo'),
						//tip_estudio: req.param('tip_estudio'),
						tomo: req.param('tomo'),
						rayo: req.param('rayo'),
						reso: req.param('reso'),
						contraste: req.param('contraste'),
						craneo: req.param('craneo'),
						cuello: req.param('cuello'),
						torax: req.param('torax'),
						abdomen: req.param('abdomen'),
						pelvis: req.param('pelvis'),
						hombro: req.param('hombro'),
						brazo: req.param('brazo'),
						codo: req.param('codo'),
						ante: req.param('ante'),
						muneca: req.param('muneca'),
						mano: req.param('mano'),
						cade: req.param('cade'),
						muslo: req.param('muslo'),
						rodilla: req.param('rodilla'),
						pierna: req.param('pierna'),
						tobillo: req.param('tobillo'),
						pie: req.param('pie'),
						urotac: req.param('urotac'),
						completo: req.param('completo'),
						med_sol: req.param('med_sol'),
						nro_reg: req.param('nro_reg'),
						mot_est: req.param('mot_est'),
						lugar_est: req.param('lugar_est'),
						estado : v_estado,//cargamos el valor por defecto del estado.
						nomfile : v_nomfile,
						costo: v_costo
					});
				}else{
					//MOSTRAMOS el CODIGO
					req.flash('success', 'SU CODIGO ES:	"'+v_COD_EST + '" El nombre de su archivo es: '+nombre_archivo); 

					//guardamos los datos en var globales 
					COD_EST = v_COD_EST;

					//CREAR PDF CON DATOS DE ESTUDIO
					var text = 'ESCRIBIMOS LA INFO DEL ESTUDIO';
					doc = new PDFDocument();//creating a new PDF object
					doc.pipe(fs.createWriteStream('./files/'+COD_EST+'.pdf')); //stream de escritura del archivo, lo escribimos en el filesystem
					doc.text("CODIGO de ESTUDIO: "+v_COD_EST, 100, 100);//mostrar el codigo
					doc.text("NOMBRE y APELLIDO: "+v_nombre+" "+v_apellido, 100, 150);//mostrar el codigo
					doc.text("C.I.: "+v_ci, 100, 200);//mostrar el codigo
					doc.text("COSTO: Gs."+v_costo, 100, 250);//mostramos el costo
					doc.end(); //finalizamos la escritura del archivo

					//res.redirect('/estudios/final');
					res.render('estudios/cargado',{title:"TELEMED"});
				}		
			});
		});
	}else{
		console.log(errors);
		errors_detail = "Errores: <ul>";
		for (i in errors) 
		{	error = errors[i]; 
			errors_detail += '<li>'+error.msg+'</li>'; 
		} 
		errors_detail += "</ul>"; 
		req.flash('msg_error', errors_detail); 
		res.render('estudios/add-estudio', 
		{ 
			ci: req.param('ci'), 
			nombre: req.param('nombre')
		});
	}
});

//get de agregado
app.get('/add', function(req, res, next) {
	res.render(	'estudios/add', 
	{ 
		title: 'Agregar nuevo estudio',
		ci: '',
		nombre: '',
		apellido:'',
		fec_estudio:''
		//FALTA: agregar todos los otros campos
	});
});

//GET DE EDICION DE ESTUDIO //OBTENCION DE DATOS Y MUESTRA
app.get('/editar/(:id)', function(req,res,next){
	req.getConnection(function(err,connection){
		var query = connection.query('SELECT * FROM estudio where id='+req.params.id,function(err,rows)
		{
			if(rows.length <= 0)
			{
				var errornya  = ("Error Selecting : %s ",err );  
				req.flash('error', errors_detail); 
				res.redirect('/estudios'); 
			}else
			{
				if(rows.length <=0)
				{
					req.flash('error', "No se encuentra estudio!"); 
					res.redirect('/estudios');
				}
				else
				{	
					console.log(rows);
					res.render('estudios/editar',{title:"Editar",data:rows[0]});
				}
			}
		});
	});
});

/* boton de ACTUALIZAR DIAGNOSTICO en /estudios/editar/(id) */
app.post('/editar/(:id)', function(req,res,next){
	//req.assert('nombre', 'Please fill the name').notEmpty();
	var errors = req.validationErrors();
	if (!errors) {

		var now = new Date();
		var fecha = now.toLocaleString();
		v_diagnostico = req.sanitize('diagnostico').escape();
		var customer = {diagnostico : v_diagnostico, estado : "DIAGNOSTICADO", diagnostico_dttm : fecha }

		var update_sql = 'update estudio SET ? where id = '+req.params.id;
		req.getConnection(function(err,connection){
			var query = connection.query(update_sql, customer, function(err, result){
				if(err)
				{
					var errors_detail  = ("Error Update : %s ",err );   
					req.flash('error', errors_detail); 
					res.render('estudios/editar',{title:"Editar"});
					/*res.render('estudios/editar', 
					{ 
						tip_diagnostico: req.param('diagnostico'), title: "TELEMED"
					});*/
				}else{
					req.flash('success', 'Diagnostico actualizado'); 
					res.redirect('/estudios');
					//res.redirect('/estudios/editar/'+req.params.id);
				}		
			});
		});
	}else{

		console.log(errors);
		errors_detail = "ERROR: <ul>";
		for (i in errors) 
		{ 
			error = errors[i]; 
			errors_detail += '<li>'+error.msg+'</li>'; 
		} 
		errors_detail += "</ul>"; 
		req.flash('msg_error', errors_detail); 
		res.render('estudios/add-estudio', 
		{ //falta probar esta llamada
			nombre: req.param('nombre'), 
			ci: req.param('ci')
		});
	}
});
//FIN EDITAR USUARIO



//GET DE EDICION DE ESTUDIO 
//OBTENCION DE DATOS Y MUESTRA
app.get('/descargar', function(req,res,next){
	req.getConnection(function(err,connection){
		var query = connection.query('SELECT id,cod,ci,nombre,apellido,fec_estudio,tel,estado, nomfile FROM estudio where cod ="'+req.sanitize('cod')+'"',function(err,rows)
		//var query = connection.query('SELECT id,cod,ci,nombre,apellido,fec_estudio,tel FROM estudio',function(err,rows) // debug: traer todos.
		{
		  if(err)
		  {	req.flash('error', errors_detail); 
			//res.redirect('/consultas',{title:"Consultar"}); 
		  }else
		  {
			if(rows.length <=0)
			{ req.flash('error', "No se encuentra estudio!"); 
			  //res.redirect('/consultas',{title:"Consultar"});
			}
			else
			{	
				/* PRUEBA GENERAMOS PDF Y MOSTRAMOS EN EL BROWSER */
				/* MOSTRAMOS EL PDF CON LA INFO GENERADA 
				TENDREMOS QUE REDIRIGIR A PAGINA DE ESTUDIO AGREGADO*/
				/* AL ESCRIBIR NO CIERRA EL ARCHIVO HASTA QUE TERMINE EL REQ!!!!!! */

				//para escribir PDF -- ESTE CODIGO NO USAMOS AQUI
				//var text = 'ESCRIBIMOS LA INFO de los datos';
				//doc = new PDFDocument();//creating a new PDF object
				//doc.pipe(fs.createWriteStream('./files/test4.pdf'));  //creating a write stream to write the content on the file system
				//doc.text(text, 100, 100);//agregando el texto a escribirse
				//doc.end(); //finalizamos la escritura del archivo
				/* EL CODIGO ANTERIOR NO USAMOS AQUI */

				console.log(rows[0].nomfile);
				//descargar solamente si ya tenemos generado el archivo.
				var file = path.resolve("./files/"+rows[0].nomfile);
				res.contentType('Content-Type',"application/pdf");
				res.download(file, function (err) {
				if (err) {
					console.log("ERROR AL ENVIAR EL ARCHIVO:");
					console.log(err);
				} else {
					console.log("ARCHIVO ENVIADO");
				}
			  });
	  
	  
			  console.log(rows);
			  nombre_archivo=rows[0].nomfile;//asignar nombre archivo del primer reg retornado (se supone el unico)
			  //res.render('consultas/listar',{title:"Editar",data:rows});//mostramos la pagina listar
			}
		  }
		});
	});
});


//BORRAR USUARIO
app.delete('/eliminar/(:cod)', function(req, res, next) {
	req.getConnection(function(err,connection){
		var customer = {cod: req.params.cod}
		
		var delete_sql = 'delete from estudio where ?';
		req.getConnection(function(err,connection){
			var query = connection.query(delete_sql, customer, function(err, result){
				if(err)
				{
					var errors_detail  = ("Error Delete : %s ",err);
					req.flash('error', errors_detail); 
					res.redirect('/estudios');
				}
				else{
					req.flash('success', 'Estudio Borrado'); 
					res.redirect('/estudios');
				}
			});
		});
	});
});

module.exports = app;