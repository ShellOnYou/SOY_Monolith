$( function() {
  $( ".popupCloseButton" ).click( function() {
    $( ".hover_bkgr_fricc" ).hide();
  } );
} );

function cancel() {
  $( ".hover_bkgr_fricc" ).hide();
}

function showSession( ps_id ) {
  $( ".profileData" ).html( "" );
  //$.get( "/API/skills/" + $( "html" )[ 0 ].lang, function( data ) {
  $.get( "/session/stu/" + ps_id, function( data ) {
      $( ".profileData" ).append( data );
    } );
    $( ".hover_bkgr_fricc" ).show();
  //} );
}

function registerSession( ps_id ) {
  $.post( "/API/session/addStudent", {
    ps_id: ps_id,
    secret_key: $( "#secret_key_id" ).val()
  }, function( data, status ) {
    const log = JSON.parse( data ).log;
    $( "#s" + ps_id ).remove();
    $( "#notif" ).html( "<p><font color=\"green\">" + log + "</font></p>" );
  } )
    .fail( function( r, e, x ) {
      const log = JSON.parse( r.responseText ).log;
      $( "#notif" ).html( "<p><font color=\"red\">" + log + "</font></p>" );
    } );
  $( ".hover_bkgr_fricc" ).hide();
  setTimeout(function () {
    // after 2 seconds
    window.location = "/"; // redirect to home page
 }, 2000)
}
