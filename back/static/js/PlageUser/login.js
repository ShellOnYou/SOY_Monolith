$( function() {
  $( "#login_form" ).submit( function( e ) {
    $( "#notif" ).html( "" );
    e.preventDefault();

    if ( typeof FormData === "undefined" ) {
      throw new Error( "FormData non supporté" );
    }

    const formdata = new FormData( $( "#login_form" )[ 0 ] );

    subLogin( formdata );
  } );
} );

function subLogin( formdata ) {
  $.ajax( {
    type: "POST",
    enctype: "multipart/form-data",
    url: "/API/user/login",
    data: formdata,
    processData: false,
    contentType: false,
    cacher: false,
    timeout: 600000,
    success: function( res ) {
      console.log( res );
      window.location.href = "/user/dashboard";
    },
    error: function( r, e, x ) {
      $( "#notif" ).html( "<p><font color=\"red\">" + JSON.parse( r.responseText ).message + "</font></p>" );
    }
  } );
}
