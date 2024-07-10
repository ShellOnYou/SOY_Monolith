$( function() {
    $( "#pwd_form" ).submit( function( e ) {
      $( "#notif" ).html( "" );
      e.preventDefault();
  
      if ( typeof FormData === "undefined" ) {
        throw new Error( "FormData non supporté" );
      }
      const formdata = new FormData( $( "#pwd_form" )[ 0 ] );
      $.ajax( {
        type: "POST",
        enctype: "multipart/form-data",
        url: "/user/changepassword",
        data: formdata,
        processData: false,
        contentType: false,
        cacher: false,
        timeout: 600000,
        success: function( res ) {
          const message = "<p><font color=\"green\">" + JSON.parse( res ).message + "</font></p>";
          $( "#notif" ).html( message );
          setTimeout(function () {
            // after 2 seconds
            window.location = "/";
         }, 2000)
        },
        error: function( r, e, x ) {
          $( "#notif" ).html( "<p><font color=\"red\">" + JSON.parse( r.responseText ).message + "</font></p>" );
        }
      } );
    } );
    
} );

