$( function() {
  /* alert($( "#user_id_id" ).val())*/
  /* ecouteur d'event click sur un elem html de class css "exo_delete" */
  $( ".exo_delete" ).click( function( e ) {
    e.preventDefault();

    $.ajax( {
      type: "DELETE",
      url: $( this ).attr( "href" ),
      success: function( data, textstatus, xhr ) {
        if ( xhr.status == 200 ) {
          $( "#notif" ).html( "<p><font color=\"green\">"+JSON.parse( data ).message+"</font></p>" );}
          
        else { // never called ?
          $( "#notif" ).html( "<p><font color=\"red\">Error when trying to delete the exercise</font></p>" );
        }
        setTimeout(function () {
          // reload page after 2 seconds
          window.location = "/exercise/list";
        }, 2000)
      },
      error: function( r, e, x ) { // coming here when 500 return code obtained
        $( "#notif" ).html( "<p><font color=\"red\">Error when trying to delete the exercise</font></p>" );
        console.log( x );
        setTimeout(function () {
          // reload page after 2 seconds
          window.location = "/exercise/list";
        }, 2000)
      }
    } );
  } );

} );

function launchExTest(ex_id) {
    $.post('/API/StudentStatement/test', {
        ex_id: ex_id
    }, function (data, status) {
        window.location.href = '/StudentStatement/test/' + ex_id
    }).fail(function (err) {
        console.log(err)
        $('#notif').html('<p><font color="red">' + err.responseText + '</font></p>')
    })
}

