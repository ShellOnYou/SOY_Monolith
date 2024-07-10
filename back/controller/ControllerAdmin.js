const debug = require("debug")("ControllerAdmin");
const ModelPlageUser = require("../model/ModelPlageUser");

getAllUsers = async function (req, res) {
  debug("Read all users");
  const user = req.session;
  const usersList = await ModelPlageUser.getAllUsers();
  const roles = await ModelPlageUser.getAllRoles();

  if (usersList) {
    debug("got some users");
    return {
      locale: req.i18n.getLocale(),
      pageTitle: req.i18n.__("Roles Control"),
      user: user,
      users: usersList,
      roles: roles,
    };
  } else {
      debug("Got no user !!!");    
      return null;
  }
};

module.exports.getAllUsersWeb = async function (req, res) {
  const asw = await getAllUsers(req, res);

  if (asw) {
    res.render("PlageUser/rolesDashboard", asw);

  } else {
    res.status(500).end();
  }
};

updateRole = async function (req, res) {
  debug("Update user's role");
  let updated = await ModelPlageUser.updateRole(
    req.params.user_id,
    req.params.role_id
  );

  if (updated) {
    return updated;
  } else {
    return null;
  }
};

module.exports.updateRoleWeb = async function (req, res) {
  const asw = updateRole(req, res);

  if (asw) {
    res.redirect("/users/roles");
  } else {
    res.status(500).end();
  }
};

module.exports.updateRoleAPI = async function (req, res) {
  const asw = updateRole(req, res);

  if (asw) {
    res.status(200).end(JSON.stringify(asw));
  } else {
    res.status(500).end();
  }
};
