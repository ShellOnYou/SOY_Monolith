$( function() {
    $( "#email_form" ).submit( function( e ) {
      $( "#notif" ).html( "" );
      e.preventDefault();
  
      if ( typeof FormData === "undefined" ) {
        throw new Error( "FormData non supporté" );
      }
      const formdata = new FormData( $( "#email_form" )[ 0 ] );
      //FAIRE REQUETE POUR VOIR SI MAIL ENVOYE
      $.ajax( {
        type: "POST",
        enctype: "multipart/form-data",
        url: "/user/emailpassword",
        data: formdata,
        locale: document.documentElement.lang,
        processData: false,
        contentType: false,
        cacher: false,
        timeout: 600000,
        // to do: do not send a return message as this allows advanced users to know whether an email is registered
        success: function( res ) {
          const message = "<p><font color=\"green\">" + JSON.parse( res ).message + "</font></p>";
          $( "#notif" ).html( message );
          setTimeout(function () {
            // after 2 seconds
            window.location = "/";
         }, 10000) 
        } 
      } );
    } );
    
} );

