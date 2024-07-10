$( function() {
  initLocale();

  $( "#signup_form" ).submit( function( e ) {
    e.preventDefault();

    if ( typeof FormData === "undefined" ) {
      throw new Error( "FormData non supporté" );
    }

    const formdata = new FormData( $( "#signup_form" )[ 0 ] );

    switch ( $( "#action_id" ).val() ) {
      case "create":
        subCreate( formdata );
        break;
    }
  } );
} );

function initLocale() {
  console.log( $( "html" )[ 0 ].lang );
  $( "#locale_id" ).val( $( "html" )[ 0 ].lang ).change();
}

function subCreate( formdata ) {
  $.ajax( {
    type: "POST",
    enctype: "multipart/form-data",
    url: "/user",
    data: formdata,
    processData: false,
    contentType: false,
    cacher: false,
    timeout: 600000,
    success: function( res ) {
      const message = "<p><font color=\"green\">" + JSON.parse( res ).message + "</font></p>";
      $( "#notif" ).html( message );
    },
    error: function( r, e, x ) {
      if ( x == "Request Entity Too Large" ) {
        $( "#notif" ).html( "<p><font color=\"red\">File size too large, please check this is the correct file.</font></p>" );
      } else if ( r.responseText ) {
        $( "#notif" ).html( "<p><font color=\"red\">" + JSON.parse( r.responseText ).message + "</font></p>" );
      } else {
        $( "#notif" ).html( "<p><font color=\"red\">" + x + "</font></p>" );
      }
    }
  } );
}
