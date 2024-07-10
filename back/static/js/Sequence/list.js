$( function() {
    $( ".seq_delete" ).click( function( e ) {
      e.preventDefault();
      $( "#t" + this.id ).remove();
      $.ajax( {
        type: "DELETE",
        url: $( this ).attr( "href" ),
        success: function( data, textstatus, xhr ) {
          if ( xhr.status == 200 ) {
            $( "#notif" ).html( "<p><font color=\"green\">La séquence a bien été effacée</font></p>" );
          } else {
            $( "#notif" ).html( "Erreur lors de la suppression de la séquence" );
          }
        },
        error: function( r, e, x ) {
          console.log( x );
        }
      } );
    } );
  
  } );