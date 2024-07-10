$( function() {
  $( "#form_rendu" ).submit( function( e ) {
    $( "#notif" ).html( "" );
    e.preventDefault();
    var tarball = $( "#tarball" ).val();
    var taille_tarball = $( "#tarball" )[ 0 ].files[ 0 ].size;
    if ( taille_tarball <= 2000000 ) {
      if ( tarball.indexOf( ".tar.gz" ) != -1 && tarball.indexOf( ".tar.gz" ) == tarball.length - 7 ) {
        $( "#notif" ).html( "Travail en cours d'envoi ..." );
        var href = $( window.location ).attr( "href" );
        var id = href.substring( href.indexOf( "?id=" ) + 4 );
        $( "#id" ).val( id );
        if ( typeof FormData === "undefined" ) {
 throw new Error( "FormData non supporté" );
}
        var formdata = new FormData( $( this )[ 0 ] );

        // formdata.append({"comment":$("#commentaires").val()});
        $.ajax( {
          type: "POST",
          enctype: "multipart/form-data",
          url: "./rendu.js",
          data: formdata,
          processData: false,
          contentType: false,
          cache: false,
          timeout: 600000,
          success: function( data ) {
            var reponse = JSON.parse( data );
            $( "#notif" ).html( reponse.message );
            if ( reponse.analyse != undefined ) {
              console.log( reponse.analyse );
              document.getElementById( "analyse" ).innerHTML = reponse.analyse;

              // $("#analyse").html(reponse.analyse);
              // window.scrollTo(0,document.body.scrollHeight);
              $( "html, body" ).animate( {
                scrollTop: $( "#analyse" ).offset().top
              }, 1500 );
            } else {
              $( "#analyse" ).html( "" );
            }
          },
          error: function( r, e, x ) {
            console.log( x );
            if ( x == "Request Entity Too Large" ) {
              $( "#notif" ).html( "La taille du fichier à uploader est trop importante. Vérifier que c'est le bon fichier.<br/>" );
            } else {
              $( "#notif" ).html( x );
            }
          }
        } );
      } else {
        $( "#notif" ).html( "L'archive uploadée n'est pas au bon format (.tar.gz)" );
        $( "#analyse" ).html( "" );
      }
    } else {
      $( "#notif" ).html( "La taille de l'archive uploadée dépasse la taille maximale autorisée (2 Mo)<br/>" );
      $( "#analyse" ).html( "" );
    }
  } );
} );
