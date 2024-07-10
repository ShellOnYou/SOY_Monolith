$( function() {
  initButton();

  $( "#profile_form" ).submit( function( e ) {
    $( "#notif" ).html( "" );
    e.preventDefault();

    if ( typeof FormData === "undefined" ) {
      throw new Error( "FormData not supported" );
    }

    const formdata = new FormData( $( "#profile_form" )[ 0 ] );
    switch ( $( "#action_id" ).val() ) {
      case "create":
        subCreate( formdata );
        
        break;
      case "update":
        subUpdate( formdata );
        break;
    }
   
  } );
} );

function initButton() {
  if ( $( "#action_id" ).val() == "update" ) {
    $( "#create" ).hide();
  } else {
    $( "#update" ).hide();
  }
}

function subCreate( formdata ) {
  $.ajax( {
    type: "POST",
    enctype: "multipart/form-data",
    url: "/profile",
    data: formdata,
    processData: false,
    contentType: false,
    cacher: false,
    timeout: 600000,
    success: function( res ) {
      const message = "<p><font color=\"green\">" + JSON.parse( res ).log + "</font></p>";
      $( "#notif" ).html( message );
      setTimeout(function () {
        // after 2 seconds
        window.location = "/";
     }, 2000)
    },
    error: function( r, e, x ) {
      $( "#notif" ).html( "<p><font color=\"red\">" + JSON.parse( r.responseText ).log + "</font></p>" );
    }
  } );
}

function subUpdate( formdata ) {
  $.ajax( {
    type: "PUT",
    enctype: "multipart/form-data",
    url: "/profile",
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
      $( "#notif" ).html( "<p><font color=\"red\">" + JSON.parse( r.responseText ).message + "</font></p>" );
    }
  } );
}
