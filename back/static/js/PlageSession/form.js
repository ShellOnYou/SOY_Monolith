$( function() {
  initButton();
  initProfile();

  $( "#session_form" ).submit( function( e ) {
    $( "#notif" ).html( "" );
    e.preventDefault();

    if ( typeof FormData === "undefined" ) {
      throw new Error( "FormData non supporté" );
    }

    const formdata = new FormData( $( "#session_form" )[ 0 ] );

    if ( $( "#p_id_id" ).val() != "empty" ) {
      switch ( $( "#action_id" ).val() ) {
        case "create":
          subCreate( formdata );
          break;
        case "update":
          subUpdate( formdata );
          break;
      }
    }
  } );
} );

function chooseProfile( p_id ) {
  const lastId = $( "#p_id_id" ).val();
  if ( lastId != "empty" ) {
    $( "#p" + lastId ).show();
  } else {
    $( "#choosenProfile" ).show();
    $( "#chooseProfile" ).hide();
  }
  $( "#p" + p_id ).hide();
  $( "#p_id_id" ).val( p_id );
  $( "#pjob" ).html( $( "#j" + p_id ).html() );
  $( "#plevel" ).html( $( "#l" + p_id ).html() );
  $( "#psector" ).html( $( "#s" + p_id ).html() );
}

function chooseSequence( seq_id ) {
  console.log(seq_id)
  const lastId = $( "#seq_id_id" ).val();
  console.log(lastId)
  if ( lastId != "empty" ) {
    $( "#btn" + lastId ).show();
    $("#seq"+lastId).css("font-weight","normal");
    $("#seqv"+lastId).css("font-weight","normal");    
    $("#seq_row"+lastId).css("background-color","white");
  } else {
    $( "#choosenSequence" ).show();
    $( "#chooseSequence" ).hide();
  } 
  $( "#btn" + seq_id ).hide();
  $( "#seq_id_id" ).val( seq_id );
  $( "#seqid" ).html( $( "#seq" + seq_id ).html() );
  $( "#create" ).removeAttr("disabled");
  $("#seq"+seq_id).css("font-weight","bold");
  $("#seqv"+seq_id).css("font-weight","bold");
  $("#seq_row"+seq_id).css("background-color","#e6f7ff");
}

function initButton() {
  if ( $( "#action_id" ).val() == "update" ) {
    $( "#create" ).hide();
  } else {
    $( "#update" ).hide();
    $( "#create").attr("disabled","disabled");
  }
}

function initProfile() {
  if ( $( "#action_id" ).val() == "create" ) {
    $( "#choosenProfile" ).hide();
  } else if ( $( "#action_id" ).val() == "update" ) {
    $( "#chooseProfile" ).hide();
    chooseProfile( $( "#p_id_id" ).val() );
  }
}

function subCreate( formdata ) {
  $.ajax( {
    type: "POST",
    enctype: "multipart/form-data",
    url: "/session",
    data: formdata,
    processData: false,
    contentType: false,
    cacher: false,
    timeout: 600000,
    success: function( res ) {
      const message = "<p><font color=\"green\">" + JSON.parse( res ).log + "</font></p>";
      $( "#notif" ).html( message );
      // put in the event loop and will start asyncrh 2s later
      setTimeout(function () {
        window.location = "/";
      }, 2000)
    },
    error: function( r, e, x ) {
      $( "#notif" ).html( "<p><font color=\"red\">" + JSON.parse( r.responseText ).log + "</font></p>" );
    }
  } );
}

function subUpdate( formdata ) {
 //alert("This functionality is not yet implemented");
  $.ajax( {
    type: "PUT",
    enctype: "multipart/form-data",
    url: "/session",
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
        window.location = "/session/list";
      }, 3000)
    },
    error: function( r, e, x ) {
      $( "#notif" ).html( "<p><font color=\"red\">" + JSON.parse( r.responseText ).log + "</font></p>" );
    }
  } );
}
