const axios = require("axios");
const debug = require("debug")("ControllerHelp");
const ModelPlageUser = require('../model/ModelPlageUser')
const fs = require('fs'); // to read the help from a static file

module.exports.list = async function (req, res) {
  const user = req.session;
  debug("Begin of list route")
  debug("user is "+user.user_id)
  if (user) {
    filename=""
    if (user.role_id == 2) {filename="teacher"}
    else if (user.role_id == 3) {filename="student"}
    else {filename="admin"} // note: no help for admin at the moment
    urlFile = 'static/files/help/' + filename + "." + req.i18n.getLocale() + ".html"
    debug("Built filename : "+filename)
    data = ""
    fs.readFile(urlFile, 'utf8', function (err,data) {
      if (err) { return console.log("ERROR\n"+err); } 
      debug("Asking to render Help information from file "+urlFile)
      res.status(200).json(data)
    }) 
  } else {
    debug("Cannot give help info to user that is not connected")
    res.redirect('/')
  }
}; 


