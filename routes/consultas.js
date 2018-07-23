var express = require('express');
var app = express();
var fs=require('fs');
var path = require('path');
PDFDocument = require('pdfkit');//para generar el pdf.
var nombre_archivo='noname';

/*
Pantalla que muestra el estado de una consulta de ID estudio,
input con submit, consultar en tabla y mostrar info.

*/

/* GET de estudios, raiz */
app.get('/', function(req, res, next) {
  res.render('consultas/consultar', 
  { title: 'TELEMED', par: 'consulta del estado del estudio enviado a través del ID generado anteriormente' });//test
});



/* GET para descarga de archivo. usamos helper de express. 
get de consulta/descargar*/
app.get('consultas/descargar', function(req, res){
  var file = './files/' + nombre_archivo;//nombre del archivo a descargar
  res.download(file); //disponibilizar y enviar archivo.
  req.flash('success', "Archivo descargado"); 
});


/* aqui generamos el pdf de estudio diagnosticado y con el boton de descargar se baja el estudio, una vez que el estado sea pagado. */
app.get('/pagar', function(req, res, next) {
  req.getConnection(function(err,connection){
  var query = connection.query('SELECT id,cod,ci,nombre,apellido,fec_estudio,estado, nomfile,costo,diagnostico,estado FROM estudio where cod ="'+req.sanitize('cod').escape().trim()+'"',function(err,rows)
  //var query = connection.query('SELECT id,cod,ci,nombre,apellido,fec_estudio,tel FROM estudio',function(err,rows) // debug: traer todos.
  {
    if(err)
    {
      var errornya  = ("Error Selecting : %s ",err );  
      req.flash('error', errors_detail); 
      res.redirect('/consultas'); 
    }else
    {
      if(rows.length <=0)
      { req.flash('error', "No se encuentra estudio!"); 
        res.redirect('/consultas');
      }
      else
      {	
        console.log(rows);
        //creamos el archivo.
        var text = 'ESCRIBIMOS LA INFO DEL ESTUDIO';
        doc = new PDFDocument();//creating a new PDF object
        doc.pipe(fs.createWriteStream('./files/DIAG_'+rows[0].cod+'.pdf')); //stream de escritura del archivo, lo escribimos en el filesystem
        doc.text("CODIGO de ESTUDIO: "+rows[0].cod, 100, 100);//mostrar el codigo
        doc.text("NOMBRE y APELLIDO: "+rows[0].nombre+" "+rows[0].apellido, 100, 150);//mostrar el codigo
        doc.text("C.I.: "+rows[0].ci, 100, 200);//mostrar el codigo
        doc.text("COSTO: Gs."+rows[0].costo, 100, 250);//mostramos el costo
        doc.text("DIAGNOSTICO: "+rows[0].diagnostico, 100, 300);//mostramos el costo
        doc.end(); //finalizamos la escritura del archivo

        res.render('consultas/pagar',{title:"PAGAR",data:rows});//mostramos la pagina en donde debe pagar
      }
    }
  });
 });
});

app.get('/final', function(req, res, next) {
	req.getConnection(function(err,connection){
	//carmbiar la consulta, esta al pedo
  var query = connection.query('SELECT id,cod,ci,nombre,apellido,fec_estudio,estado, nomfile FROM estudio where cod ="'+req.sanitize('cod').escape().trim()+'"',function(err,rows)
		{
			if(err){
			var errornya  = ("Error : %s ",err );   
			req.flash('error', errornya);   }

			//DESCARGAR PDF CON DATOS DEL ESTUDIO
			var file = path.resolve("./files/DIAG_"+rows[0].cod+".pdf");
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


app.post('/consultar/', function(req, res, next) {
  req.getConnection(function(err,connection){
  var query = connection.query('SELECT id,cod,ci,nombre,apellido,fec_estudio,tel,estado, nomfile FROM estudio where cod ="'+req.sanitize('cod').escape().trim()+'"',function(err,rows)
  //var query = connection.query('SELECT id,cod,ci,nombre,apellido,fec_estudio,tel FROM estudio',function(err,rows) // debug: traer todos.
  {
    if(err)
    {
      var errornya  = ("Error Selecting : %s ",err );  
      req.flash('error', errors_detail); 
      res.redirect('/consultas'); 
    }else
    {
      if(rows.length <=0)
      { req.flash('error', "No se encuentra estudio!"); 
        res.redirect('/consultas');
      }
      else
      {	
        console.log(rows);
        nombre_archivo=rows[0].nomfile;//asignar nombre archivo del primer reg retornado (se supone el unico)
        res.render('consultas/listar',{title:"Editar",data:rows});//mostramos la pagina listar

        //res.end;
      }
    }
  });
 });
});

module.exports = app;