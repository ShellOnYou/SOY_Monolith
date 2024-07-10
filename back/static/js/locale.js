$( function() {
  $( ".loc" ).click( function( e ) {
    e.preventDefault();
    $.post( "/API/user/locale", {
      locale: e.currentTarget.id
    }, function( data, status ) {
      if ( status == "success" ) {
        location.reload();
      }
    } );
  } );

  checkCookie();
} );

function checkCookie() {
  var cookieEnabled = navigator.cookieEnabled;
  if ( !cookieEnabled ) {
    document.cookie = "testcookie";
    cookieEnabled = document.cookie.indexOf( "testcookie" ) != -1;
  }
  return cookieEnabled || showCookieFail();
}

function showCookieFail() {
  window.location.href = "/noCookies";
}

// within a window load,dom ready or something like that place your:
