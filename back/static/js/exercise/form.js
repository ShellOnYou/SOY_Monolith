$( function() {
  initButton();
  initSkills();
  
  $("#cancel_btn").on("click",function(e){
    history.back();
  })

  // Invoked when a submit button is hit
  $('#exo_form').submit(function (e) {
        tinyMCE.triggerSave()

    $( "#notif" ).html( "" );
    e.preventDefault();

    if ( typeof FormData === "undefined" ) {
      throw new Error( "FormData non supporté" );
    }
    const formdata = new FormData( $( "#exo_form" )[ 0 ] );
    switch ( $( "#action_id" ).val() ) {
      // create and addLocale send POST request
      case "addLocale":
      case "create":
        subCreate( formdata );
        break;
      // update sends PUT request  
      case "update":
        subUpdate( formdata );
        break;
    }
  } );

  // When any input changes:
  $( "input" ).change( function( e ) {
    if ( tinyMCE.activeEditor.getContent() && $( "#template_archive_id" ).val() 
         && $( "#statement_creation_script_id" ).val() && $( "#marking_script_id" ).val() ) {
     // if all above fields are filled then all states become available (not disabled)
     $( "#state_id option[value=\"Draft in progress\"]" ).attr( "disabled", false );
     $( "#state_id option[value=\"Need to be tested\"]" ).attr( "disabled", false );
     $( "#state_id option[value=\"Available\"]" ).attr( "disabled", false );
     $( "#state_id option[value=\"Require correction\"]" ).attr( "disabled", false );

     
  } );
} );


// State
 
function stateChange( state ) {
  // Only allows the state given in parameter
  // 1) puts all to disabled
  $( "#state_id option[value=\"Draft in progress\"]" ).attr( "disabled", "disabled" );
  $( "#state_id option[value=\"Need to be tested\"]" ).attr( "disabled", "disabled" );
  $( "#state_id option[value=\"Available\"]" ).attr( "disabled", "disabled" );
  $( "#state_id option[value=\"Require correction\"]" ).attr( "disabled", "disabled" );
  // 2) re-enables the state received in param
  $( "#state_id option[value=\"" + state + "\"]" ).attr( "disabled", false );
  // 3) activate the change
  $( "#state_id" ).val( state ).change();
}

// Skills
function initSkills() {
  $.get( "/API/skills/" + $( "html" )[ 0 ].lang, function( data ) {
    
    displaySkill( addSkill( data ) );
    if ( $( "#action_id" ).val() == "update") {
      $.get( "/API/skills/ex/" + $( "#ex_id_id" ).val(), function( data ) {
        const tab = JSON.parse( data );
        
        for ( let i = 0; i < tab.length; i++ ) {          
          $( "#" + tab[ i ].skill_code + "_id" ).prop( "checked", true );
        }
      } );
    }
    if ($( "#action_id" ).val() == "addLocale") {
      $.get( "/API/skills/ex/" + $( "#ref_id_id" ).val(), function( data ) {
        const tab = JSON.parse( data );
        
        for ( let i = 0; i < tab.length; i++ ) {
          $( "#" + tab[ i ].skill_code + "_id" ).prop( "checked", true );
        }
      } );
    }
  } );
}
function addSkill( data ) {  
  const tab = JSON.parse( data );
  const tabSkill = new Array();
  for ( let i = 0; i < tab.length; i++ ) {
    tabSkill[ i ] = new Array();
    tabSkill[ i ].push( tab[ i ].name );
    tabSkill[ i ].push( tab[ i ].ref_code );
  }
  
  return tabSkill;
}
function clearSkill() {
  $( "#divSkill" ).html( "" );
}
function displaySkill( tab ) {
  clearSkill();

  for ( let i = 0; i < tab.length; i++ ) {
    $( "#divSkill" ).append( "<div><input type=\"checkbox\" id=\"" + tab[ i ][ 1 ] + "_id\" name=\"skills\" value=\"" + tab[ i ][ 1 ] + "\"> <label for=\"" + tab[ i ][ 1 ] + "_id\">" + tab[ i ][ 0 ] + "</label>" );
  }
}

// Init Form submit button
function initButton() {
  $( "#submit" ).hide();
  if ( $( "#action_id" ).val() == "update" ) {
    $( "#create" ).hide();
  } else {
    $( "#update" ).hide();
  }
}

//  
function launchExTest( ex_id ) {
  $.post( "/API/StudentStatement/test", {
    ex_id: ex_id
  }, function( data, status ) {
    if ( status == "success" ) {
      $( "#validate" ).html( "<a href=\"/StudentStatement/test/" + ex_id + "\">Acceder au test</a>" );
    }
  } );
}


 // SUBMIT FORM
function subCreate( formdata ) {
  $.ajax( {
    type: "POST",
    enctype: "multipart/form-data",
    url: "/exercise",
    data: formdata,
    processData: false,
    contentType: false,
    cacher: false,
    timeout: 600000,
    success: function( res ) {
      const message = "<p><font color=\"green\">" + JSON.parse( res ).message + "</font></p>";

      // alert(JSON.parse(res).message)
	    if ( JSON.parse( res ).message != "Un exercice du même nom existe. Changer le nom SVP" ) {
  setTimeout(function () {
        // after 2 seconds
        window.location = "/";
     }, 2000)
}
      $( "#notif" ).html( message );
    },
    error: function( r, e, x ) {
      $( "#notif" ).html( "<p><font color=\"red\">" + x + "</font></p>" );
    }
  } );
}

function getSelectedSkills() {
  let all_skills = ($( "#exo_form" )[ 0 ]).skills;
  let selected_skills = [];
  for(let skill of all_skills) {
    if(skill.checked) {
      selected_skills.push(skill.value);
    }
  }
  return selected_skills;
}

function subUpdate( formdata ) {
  
  $.ajax( {
    type: "PUT",
    enctype: "multipart/form-data",
    url: "/exercise",
    data: formdata,
    processData: false,
    contentType: false,
    cacher: false,
    timeout: 600000,
    success: function( res ) {
      let message = "<p><font color=\"green\">" + JSON.parse( res ).message + "<br/>";
      message += "You will be redirected to the list of exercises"+ "</font></p>";
      $( "#notif" ).html( message );
      
      
      
      setTimeout(function () {
        // after 2 seconds
        window.location = "/exercise/list";
     }, 2000)
    },
    error: function( r, e, x ) {
      $( "#notif" ).html( "<p><font color=\"red\">" + x + "</font></p>" );
    }
  } );
}
