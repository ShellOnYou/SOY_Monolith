let loc;
const lang = $( "html" )[ 0 ].lang;

switch ( lang ) {
  case "fr":
    loc = "fr_FR";
    break;
  case "en":
  default:
    loc = "en_US";
    break;
}

tinymce.init( {
  selector: "#template_statement_id",
  plugins: "code",
  height: 400,
  language: loc,
  language_url: "/js/TinyMCE/langs/fr_FR.js"
} );
