const fs = require( "fs" );
const ModelDB = require( "../../model/ModelDB" );

const client = ModelDB.connect_to_db();

client.query( "DELETE FROM Skill" )
  .then( res => {
    console.log( res );
  } )
  .catch(
    err => {
      console.error( "Error executing query", err.stack );
    } );

client.query( "DELETE FROM Theme" )
  .then( res => {
    console.log( res );
  } )
  .catch( err => {
    console.error( "Error executing query", err.stack );
  } );

fs.readFile( "Themes.json", ( err, data ) => {
  if ( err ) {
throw err;
}
  const theme = JSON.parse( data );
  for ( let i = 0; i < theme.Thèmes.length; i++ ) {
    client.query( "INSERT INTO Theme (th_id, name) VALUES ($1::int, $2::varchar)", [ i, theme.Thèmes[ i ] ] )
      .catch( err => console.error( "Error executing query", err.stack ) );
  }
} );

fs.readFile( "Competences.json", ( err, data ) => {
  if ( err ) {
throw err;
}
  const comp = JSON.parse( data );
  for ( let i = 0; i < comp.Compétences.length; i++ ) {
    client.query( "INSERT INTO Skill (skill_code, name, th_id) VALUES ($1::varchar, $2::varchar, $3::int)", [ comp.Compétences[ i ].code, comp.Compétences[ i ].nom, comp.Compétences[ i ].Thème ] )
      .catch( err => console.log( "Error executing query", err.stack ) );
  }
} );
