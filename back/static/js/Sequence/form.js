// JQuery function called automatically at the end of body loading
$( function() {
  initSubmitButton();
  initProfile();
  $( "#seq_lst_form" ).submit( function( e ) {
    $( "#notif" ).html( "" );
    e.preventDefault();

    if ( typeof FormData === "undefined" ) {
      throw new Error( "FormData non supporté" );
    }
    const formdata = new FormData( $( "#seq_lst_form" )[ 0 ] );
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

function initSubmitButton() {
  if ( $( "#action_id" ).val() == "update" ) {
    $( "#create" ).hide();
  } else {
    $( "#update" ).hide();
  }
}
function initProfile() {
  if ( $( "#action_id" ).val() == "create" ) {
    $( "#choosenProfile" ).hide();
    $( "#create" ).hide();
  } else if ( $( "#action_id" ).val() == "update" ) {
    $( "#chooseProfile" ).hide();
    chooseProfile( $( "#p_id_id" ).val() );
  }
}

// Called everytime a change is made to an exercise in/out of the sequence
function chooseExercise(id) { 
    let exos = []
    // build js array from hidden field if already filled
    if ($("#exos").val() != undefined ) { exos = JSON.parse($("#exos").val()) }
    // remove this exo from if already selected (as we may modify its rank or lmin rating)
    exos = exos.filter(ex => ex.id != id)
    // if selected adds corresponding js object to selected exercises
    if ($("#e" + id).prop("checked")) {
        var obj = { 'id': id, 'r': $("#r" + id).val(), 'mr': $("#mr" + id).val() }
        // add new/modified exo in exos array
        exos.push(obj)        
    }
    $("#exos").val(JSON.stringify(exos));  // reset #exo hidden field from modifies exos object
  }

  function chooseProfile( p_id ) {
    const lastId = $( "#p_id_id" ).val();
    if ( lastId != "empty" ) {
      $( "#p" + lastId ).show();
    } else {
      $( "#choosenProfile" ).show();
      $( "#chooseProfile" ).hide();
      $( "#create" ).show();
    }
    $( "#p" + p_id ).hide();
    $( "#p_id_id" ).val( p_id );
    $( "#pjob" ).html( $( "#j" + p_id ).html() );
    $( "#plevel" ).html( $( "#l" + p_id ).html() );
    $( "#psector" ).html( $( "#s" + p_id ).html() );
  }


function subCreate( formdata ) {
  $.ajax( {
    type: "POST",
    enctype: "multipart/form-data",
    url: "/sequence",
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
    url: "/sequence",
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
        window.location = "/sequence/list";
      }, 3000)
    },
    error: function( r, e, x ) {
      $( "#notif" ).html( "<p><font color=\"red\">" + JSON.parse( r.responseText ).message + "</font></p>" );
    }
  } );
}
