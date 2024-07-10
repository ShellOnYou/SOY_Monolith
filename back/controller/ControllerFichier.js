const { exec } = require( "child_process" );
const fs = require( "fs" );
const ModelDB = require( "../model/ModelDB.js" );

module.exports = {
  use_fs: async function( file, rep ) {
    if ( file.includes( ".html" ) ) {
file = file.substring( file.lastIndexOf( "/" ) + 1 );
} else if ( file.includes( ".css" ) ) {
file = file.substring( file.lastIndexOf( "css/" ) );
}
    if ( file.includes( ".png" ) ) {
file = file.substring( file.lastIndexOf( "img/" ) );
}
    if ( file.includes( ".js" ) ) {
file = file.substring( file.lastIndexOf( "js/" ) );
}

    fs.readFile( file, async function( err, data ) {
      if ( err ) {
        console.log( err );
        rep.writeHead( 404, { "Content-Type": "text/html" } );
        rep.end( data );
      } else {
        if ( file.includes( ".html" ) ) {
          if ( file.includes( "404.html" ) ) {
            rep.writeHead( 404, { "Content-Type": "text/html" } );
            rep.end( data );
          } else {
            if ( file.includes( "500.html" ) ) {
              rep.writeHead( 500, { "Content-Type": "text/html" } );
              rep.end( data );
            } else {
              rep.writeHead( 200, { "Content-Type": "text/html" } );
              rep.end( data );
            }
          }
        } else {
          if ( file.includes( ".css" ) ) {
            rep.writeHead( 200, { "Content-Type": "text/css" } );
            rep.end( data );
          } else {
            if ( file.includes( "jquery" ) || file.includes( "script.js" ) ) {
              rep.writeHead( 200, { "Content-Type": "text/javascript" } );
              rep.end( data );
            } else {
              if ( file.includes( ".png" ) ) {
                rep.writeHead( 200, { "Content-Type": "image/png" } );
                rep.end( data );
              } else {
                console.log( "Format demandé non reconnu pour : " + file );
              }
            }
          }
        }
      }
    } );
  },

  send_targz: function( req, rep ) {

    // sélectionner dans la table sujet l'archive correspondant	à la requête
    console.log( "Obtenir le fichier suivant : " + req.url );
    var file_path = req.url.substring( req.url.indexOf( "/" ) + 1 );
    var client = ModelDB.connect_to_db();
    var sqltest = "SELECT fichier_data FROM sujet WHERE fichier=$1;";
    client.query( sqltest, [ file_path ] )
      .then( async res => {
        if ( res != undefined && res.rows != undefined && res.rows[ 0 ].fichier_data != undefined ) {
          var data = res.rows[ 0 ].fichier_data;
          await rep.writeHead( "200", {
            "Content-Type": "application/x-gzip",
            "Content-Length": data.length
          } );
          rep.end( data );
        } else {
          console.log( "Fichier " + file_path + " introuvable" );
          ControllerFichier.use_fs( url_serv + "404.html", rep );
        }
        client.end();
      } ).catch( err => {
        console.log( err );
        ControllerFichier.use_fs( url_serv + "404.html", rep );
        client.end();
      } );

  },

  exec: function( command, rep ) {
    rep.writeHead( 200, { "Content-Type": "text/html; charset=utf-8" } );
    rep.write( "Script Node en cours d'exécution ...<br/>" ); rep.flush();
    rep.write( "<ol>" );

    const process = exec( command );

    process.stdout.on( "data", ( data ) => {
      rep.write( "<li><b>Sortie standard :</b> " + data.toString() + "</li><br/>" ); rep.flush();
    } );

    process.stderr.on( "data", ( data ) => {
      rep.write( "<li><b>Sortie erreur : </b>" + data.toString() + "</li><br/>" ); rep.flush();
    } );

    process.on( "exit", ( code ) => {
      rep.write( "</ol>" );
      rep.write( "L'exécution du script s'est terminé avec le code : " + code.toString() + "<br/>" );
      rep.end();
    } );
  }
};
