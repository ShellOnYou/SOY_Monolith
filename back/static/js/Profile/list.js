$( function() {
  $( ".profile_delete" ).click( function( e ) {
    e.preventDefault();
    $( "#s" + this.id ).remove();
    $.ajax( {
      type: "DELETE",
      url: $( this ).attr( "href" ),
      success: function( res ) {
        const message = "<p><font color=\"green\">" + JSON.parse( res ).log + "</font></p>";
        $( "#notif" ).html( message );
      },
      error: function( r, e, x ) {
        $( "#notif" ).html( "<p><font color=\"red\">" + JSON.parse( r.responseText ).log + "</font></p>" );
      }
    } );
  } );
} );
