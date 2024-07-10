// node modules

// !!! order below is important !
const debug = require( "debug" )( "index" );
const express = require( "express" );
const fileUpload = require( "express-fileupload" );
const pg = require( "pg" );
const cors = require( "cors" );

const pool = new pg.Pool( {
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  ssl: false
} );

// Config files
const ConfServ = require( "./config/ConfServ" );
const i18n = require( "i18n-2" );

const ControllerLibrary = require( "./controller/ControllerLibrary" );

const access = require( "./middlewares/accessControl" );

//Swagger
const swaggerUI = require( "swagger-ui-express" );
const openApiDocumentation = require( "./doc/API/openApiDocumentation" );

var app = express();

//Swagger routes
app.use( "/api-docs", swaggerUI.serve, swaggerUI.setup( openApiDocumentation ) );

//Set proper Headers on Backend
app.use( ( req, res, next ) => {
  res.setHeader( "Access-Control-Allow-Origin", "*" );
  res.setHeader( "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE" );
  res.setHeader( "Access-Control-Allow-Headers", "Content-Type, Authorization, X-Access-Token" );
  next();
} );

// Init static routes
app.use( "/css", express.static( __dirname + "/static/css" ) );
app.use( "/img", express.static( __dirname + "/static/img" ) );
app.use( "/js", express.static( __dirname + "/static/js" ) );
app.use( "/files", express.static( __dirname + "/static/files" ) );

//CORS:
app.use(
  cors( {
    origin: process.env.REACT_FRONT_URL.slice(0, -1), // remove slash at the end
    methods: [ "POST", "PUT", "GET", "DELETE", "OPTIONS", "HEAD" ],
    credentials: true
  } )
);

// To avoid the same req to be repeted several times in a row in the logs 
const requestLogger = (req, res, next) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`).pathname;
    if (!req.logged) {
      debug(`REQUEST: ${req.method} ${requestUrl}`);
      req.logged = true;
    }
  next();
};

app.use(requestLogger);

// Middleware to parse requests:
app.use( express.json( { limit: "1mb" } ) ); 
app.use(
  express.urlencoded( {
    extended: true
  } )
);

app.use( fileUpload() );

i18n.expressBind( app, {
  // setup some locales - other locales default to vi silently
  locales: [ "en", "fr" ],
  // set the default locale
  defaultLocale: "en",
  directory: "./locale",
  extension: ".json"
} );

// Application middleware
// This middleware will fire for any incoming request

// Setting a default locale
app.use( function( req, res, next ) {
  req.i18n.setLocale(req.headers["content-language"]);
  next();
} );


debug( "Booting ShellOnYou app" );

// Debug function
app.all( "*", function( req, rep, next ) {
  debug( req.method + " " + req.url );
  next();
} );

// ---------- User Routes ----------
app.use( require( "./routes/userRoutes" ) );

// ---------- E-Mail routes ----------
// used to email users (at account creation, forgotten passwd, ...)
app.use( require( "./routes/email" ) );

// ---------- Exercise routes ----------
app.use( require( "./routes/exercises" ) );

// ---------- Admin routes ----------
app.use( require( "./routes/admin" ) );

// ========== Download ==========
// Get PlageLib.py
app.get( "/lib/getPlagePythonLib", function( req, res ) {
  ControllerLibrary.getPlageLibPy( req, res );
} );

// ---------- Help sections ---------
app.use( require( "./routes/help" ) );

// ---------- ExerciseProduction Routes ----------
app.use( require( "./routes/exerciseProduction" ) );

// ---------- PlageSession ----------
app.use( require( "./routes/plageSession" ) );

// ---------- Profile ----------
app.use( require( "./routes/profile" ) );

// ---------- Sequence Routes ----------
app.use( require( "./routes/sequence" ) );

// ---------- Skills Routes ----------
app.use( require( "./routes/skills" ) );

// ---------- StudentStatement routes ----------
app.use( require( "./routes/studentStatement" ) );


// ---------- Default route / Error 404 ----------

app.use( function( req, res ) {
  debug(`UNEXPECTED ROUTE: ${req.originalUrl}`);
  res.status(404).send(`Resource not found at ${req.originalUrl}`);
});

// ---------- Start server ----------
app.listen( process.env.PORT || 5001,'0.0.0.0', function() {
  console.log( "ShellOnYou main back listening on port " + ( process.env.PORT || 5001 ) );
} );
