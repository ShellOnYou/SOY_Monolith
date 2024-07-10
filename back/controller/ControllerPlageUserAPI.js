const axios = require("axios");
const ConfMail = require("../config/ConfMail");
const ConfServ = require("../config/ConfServ");
const debug = require("debug")("ControllerPlageUserAPI");
const ModelPlageUser = require("../model/ModelPlageUser");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../mail");
const ModelDB = require("../model/ModelDB");
const tokenList = {};

module.exports.tokenList = tokenList

module.exports.create = async function (req, res) {
  debug("Create new user : " + JSON.stringify(req.body));
  let knowEmail = await ModelPlageUser.checkEmailinDB(req.body.email);
  if (!knowEmail) {
    if(req.body.password != req.body.password2){
      res.status(500).end(JSON.stringify({
        'message': req.i18n.__('Password not matching')
      }))
      return
    }
    
    req.body.email = req.body.email.toLowerCase()
    
    let passData = await ModelPlageUser.saltPepperHashPassword(req.body.password);
    let data = {
      user_id: undefined,
      lastname: req.body.lastname,
      firstname: req.body.firstname,
      tdgroup: req.body.tdgroup,
      email: req.body.email,
      enabled: req.body.enabled || false,
      role_id: 3,
      avatar: req.body.avatar,
      password: passData.passwordHash,
      organization: req.body.organization,
      country: req.body.country,
      locale: req.body.locale,
      student_number: req.body.student_number,
      salt: passData.salt,
      nonce: await ModelPlageUser.genRandomSalt(128)
    };

    let user = new ModelPlageUser(data);
    let userId = await user.save();

    // Send a email and res 200
    if (userId) {
      debug("Got new model:" + JSON.stringify(user));
      req.i18n.setLocale(user.locale);
      let message = req.i18n.__("Hello, welcome to SOY") + "<br/>";
      message += req.i18n.__("Click on this link to activate your account") + "---> <a href=\"";
      message += process.env.REACT_FRONT_URL + "activate/" + user.nonce + "\">";
      message += req.i18n.__('here')+"</a> <--- ";
      message += req.i18n.__('to activate your account') + "<br/>";

      debug("Calling API/email");
      
      
      sendMail(user.email, req.i18n.__("Validate your account on Polytech Plage"), {
        header: {
          img: "",
          title: req.i18n.__("Validate your account on Polytech Plage"),
          subtitle: ""
        },
        main: {
          components: [
            {
              type: "text",
              content: [
                {
                  type: "title",
                  lines: [
                    `${req.i18n.__("Hello ")} ${user.firstname} ${user.lastname},`
                  ]
                },
                {
                  type: "text",
                  lines: [
                    req.i18n.__("VALIDATE_ACCOUNT_MAIL_1"),
                    req.i18n.__("VALIDATE_ACCOUNT_MAIL_2")
                  ]
                }
              ]
            },
            {
              type: "button",
              text: `${req.i18n.__("Click")} ${req.i18n.__("here")}`,
              link: process.env.REACT_FRONT_URL + "activate/" + user.nonce
            }
          ]
        }
      }, req.i18n.__("CORDIALLY"), req.i18n.__("ALL_RIGHTS_RESERVED"), message)

      res.status(201).json({ user_id: userId });
    } else {
      res.status(500).end();
    }
  } else {
    res.status(400).end(JSON.stringify({
      'message': req.i18n.__('This e-mail is already in database')
    })); //This e-mail is already in database "Bad request"
  }
};

module.exports.readAll = async function (req, res) {
  debug("Read all users with their roles");
  const users = await ModelPlageUser.getAllUsers();
  const roles = await ModelPlageUser.getAllRoles();

  if (users) {
    for (i = 0; i < users.length; i++) {
      for (j = 0; j < roles.length; j++) {
        if (users[i].role_id === roles[j].role_id) {
          users[i].role = roles[j];
          delete users[i].role_id;
          delete users[i].name;
        }
      }
    }
    res.status(200).json(users);
  } else {
    res.status(500).end();
  }
};

module.exports.getSkills = async function (req, res) {
  debug("Get user skills")
  let user_id = req.params.userId
  let locale = req.i18n.getLocale()
  
  let skills = await ModelPlageUser.getSkills(user_id, locale)
  
  if(skills){
    res.set("Cache-control", "private, max-age=600000")
    res.status(200).json(skills)
  } else {
    res.status(404).end()
  }
}

module.exports.read = async function (req, res) {
  debug("Read a user");
  const user = await ModelPlageUser.read(req.params.userId);
  if (user) {
    delete user.nonce;
    delete user.salt;
    res.status(200).json(user);
  } else {
    res.status(500).end();
  }
};

module.exports.activate = async function (req, res) {
  debug("Activating user with his nonce");
  console.log("Activating user with his nonce");
  const validNonce = await ModelPlageUser.checkNonce(req.params.nonce);
  if (validNonce) {
    const success = await ModelPlageUser.activate(req.params.nonce);
    if (success) {
      res.status(200).end()
    } else {
      res.status(500).end()
    }
  } else {
    res.status(400).end()
  }
}

module.exports.update = async function (req, res) {
  debug("Update a user");

  if (!req.body) {

    //Invalid request
    res.status(400).end();
  } else {

    //Check if userId is right
    const currentUser = await ModelPlageUser.read(req.params.userId);

    // let passData = undefined;
    // if (req.body.password !== undefined) {
    //   passData = await ModelPlageUser.saltPepperHashPassword(req.body.password);
    // }

    if (currentUser) {
      const data = {
        user_id: req.params.userId,
        lastname: req.body.lastname,
        firstname: req.body.firstname,
        tdgroup: req.body.tdgroup,
        email: req.body.email,
        enabled: req.body.enabled,
        role_id: req.body.role_id,
        avatar: req.body.avatar,
        password: currentUser.password,
        organization: req.body.organization,
        country: req.body.country,
        locale: req.body.locale,
        student_number: req.body.student_number,
        salt: currentUser.salt,
        nonce: currentUser.nonce
      };
      const user = new ModelPlageUser(data);
      const success = await user.update();
      if (success) {

        //Get the updated User
        const newUser = await ModelPlageUser.read(req.params.userId);
        const roles = await ModelPlageUser.getAllRoles();
        for (let i = 0; i < roles.length; i++) {
          if (newUser.role_id === roles[i].role_id) {
            newUser.role = roles[i];
            delete newUser.role_id;
            delete newUser.name;
          }
        }

        //Return the updated User
        res.status(200).json(newUser);
      } else {
        res.status(500).end();
      }
    } else {
      res.status(404).end();
    }
  }
};

module.exports.delete = async function (req, res) {
  debug("Deleting User : " + req.params.userId);
  const success = await ModelPlageUser.delete(req.params.userId);
  if (success) {
    res.status(200).end();
  } else {
    res.status(500).end();
  }
};

module.exports.updateProfile = async function (req, res) {
  debug("Update user's profile");

  if (!req.body) {

    //Invalid request
    res.status(400).end();
  } else {

    //Check if userId is right
    const currentUser = await ModelPlageUser.read(req.params.userId);

    let passData = undefined;
    if (req.body.password !== undefined) {
      passData = await ModelPlageUser.saltPepperHashPassword(req.body.password);
    }
    if (currentUser) {
      const data = {
        user_id: req.params.userId,
        lastname: req.body.lastname,
        firstname: req.body.firstname,
        tdgroup: req.body.tdgroup,
        email: req.body.email,
        avatar: req.body.avatar,
        password: passData ? passData.passwordHash : undefined,
        organization: req.body.organization,
        country: req.body.country,
        locale: req.body.locale,
        student_number: req.body.student_number
      };
      const user = new ModelPlageUser(data);
      const success = await user.update();
      if (success) {

        //Get the updated User
        const newUser = await ModelPlageUser.read(req.params.userId);

        //Return the updated User
        res.status(200).json(newUser);
      } else {
        res.status(500).end();
      }
    } else {
      res.status(404).end();
    }
  }
};

module.exports.login = async function (req, res) {
  const user = await ModelPlageUser.logPlage(req.body.email, req.body.password);
  if (user) {
    if (user != "none") {
      if (user != "disabled") {

        const data = {
          user_id: user.user_id,
          email: user.email,
          lastname: user.lastname,
          firstname: user.firstname,
          locale: user.locale,
          role_id: user.role_id
        };

        let access_token_expiration = process.env.ACCESS_TOKEN_DURATION || "300000"
        const token = jwt.sign(data, process.env.SECRET_JWT, { expiresIn: access_token_expiration });
        res.cookie("access_token", token, { maxAge: access_token_expiration, httpOnly: true, SameSite: "Strict" });

        let refresh_token_expiration = process.env.REFRESH_TOKEN_DURATION || "172800000"
        const refresh_token = jwt.sign({ email: data.email }, process.env.SECRET_JWT, { expiresIn: refresh_token_expiration });
        res.cookie("refresh_token", refresh_token, { maxAge: refresh_token_expiration, httpOnly: true, SameSite: "Strict" });

        tokenList[refresh_token] = { access_token: token, refresh_token: refresh_token };

        res.status(200).json(data);
      } else {
        res.status(412).json({
          message: req.i18n.__(
            "This account is not yet enabled, please check your emails"
          )
        });
      }
    } else {
      res.status(400).json({
        message: req.i18n.__("Wrong account or password")
      });
    }
  } else {
    res.status(500).json({
      message: req.i18n.__("Internal server error")
    });
  }
};

module.exports.logout = async function (req, res) {
  debug("Want to log out user");
  res.clearCookie("access_token", { httpOnly: true, SameSite: "Strict" });
  res.clearCookie("refresh_token", { httpOnly: true, SameSite: "Strict" });
  res.status(200).send("Cookie deleted");
};

module.exports.verify = async function (req, res) {
  console.debug("Verifying token");
  let foundRefresh = false;
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(";");
    cookies.forEach(async (cookie) => {
      const cookieArray = cookie.split("=");
      let key;
      if (cookieArray[0][0] === " ") {
        key = cookieArray[0].substring(1);
      } else {
        key = cookieArray[0];
      }
      if (key === "refresh_token") {
        foundRefresh = true;
        const refresh_token = cookieArray[1];
        try {
          const decoded = jwt.verify(refresh_token, process.env.SECRET_JWT);
          const resp = await ModelPlageUser.getUserByEmailId(decoded.email);
          const data = {
            user_id: resp.user_id,
            email: resp.email,
            lastname: resp.lastname,
            firstname: resp.firstname,
            locale: resp.locale,
            role_id: resp.role_id
          };
          let access_token_expiration = process.env.ACCESS_TOKEN_DURATION || "300000"
          const token = jwt.sign(data, process.env.SECRET_JWT, { expiresIn: access_token_expiration });
          tokenList[refresh_token] = { access_token: token, refresh_token: refresh_token };
          res.cookie("access_token", token, { maxAge: access_token_expiration, httpOnly: true, SameSite: "Strict" }).status(200).json(data);
        } catch (err) {
          res.status(401).json(err);
        }
      }
    });
  }
  if (!foundRefresh) {
    res.status(401).send("Unauthenticated");
  }
};

module.exports.requestPasswordReset = async function (req, res) {
  req.i18n.setLocale(req.locale);
  const knownEmail = await ModelPlageUser.checkEmailinDB(req.body.email);
  if (knownEmail) {
    let user = await ModelPlageUser.getUserByEmailId(req.body.email);

    // Change nonce for user wanting to change passwd
    let nonce = await ModelPlageUser.genRandomSalt(128);

    // Update db to reflect change
    let success = await ModelPlageUser.updateNonce(user.user_id, nonce);

    // Update locale variable before emailing bellow
    user.nonce = nonce;

    // Preparing message to be sent
    let message = req.i18n.__("Hello ") + user.firstname + " " + user.lastname + ",<br>";
    message += req.i18n.__("Click") + " --> ";

    // page where he/she will be able to enter new password:
    message += "<a href=\"" + process.env.REACT_FRONT_URL + "changepassword/" + user.nonce + "\">";
    message += req.i18n.__("here") + "</a> <--- " + req.i18n.__("to change your password") + "<br/>";
    message += "<p>" + req.i18n.__("The ShellOnYou team") + "<br/>";
    message += req.i18n.__("See you soon") + "</p>";
    debug(message);


    sendMail(user.email, req.i18n.__("Changing your password"), {
      header: {
        img: "",
        title: req.i18n.__("Changing your password"),
        subtitle: ""
      },
      main: {
        components: [
          {
            type: "text",
            content: [
              {
                type: "title",
                lines: [
                  `${req.i18n.__("Hello ")} ${user.firstname} ${user.lastname},`
                ]
              },
              {
                type: "text",
                lines: [
                  req.i18n.__("RESET_PASSWORD_MAIL_1"),
                  req.i18n.__("RESET_PASSWORD_MAIL_2")
                ]
              }
            ]
          },
          {
            type: "button",
            text: `${req.i18n.__("Click")} ${req.i18n.__("here")}`,
            link: process.env.REACT_FRONT_URL + "changepassword/" + user.nonce
          }
        ]
      }
    }, req.i18n.__("CORDIALLY"), req.i18n.__("ALL_RIGHTS_RESERVED"), message)

    // We always return the same msg so that caller cannot try to guess whether
    // some emails are known from the site or not
  }

  res.status(202).end();
};

module.exports.resetPassword = async function (req, res) {
  debug(req.body);
  debug("To chanfge passwd, ctrl got nonce =" + req.params.nonce);
  const userByNonce = await ModelPlageUser.getUserByNonce(req.params.nonce);
  // if nonce was ok:
  if (userByNonce != "none") {
    const user = await ModelPlageUser.getUserByEmailId(userByNonce.email);
    if (user) {
      if (req.body.pwd === req.body.pwd2) {
        let passData = await ModelPlageUser.saltPepperHashPassword(req.body.pwd);
        let data = {
          "user_id": user.user_id,
          "lastname": user.lastname,
          "firstname": user.firstname,
          "tdgroup": user.tdgroup,
          "email": user.email,
          "enabled": user.enabled,
          "role_id": user.role_id,
          "avatar": user.avatar,
          "password": passData.passwordHash,
          "organization": user.organization,
          "country": user.country,
          "locale": user.locale,
          "student_number": user.student_number,
          "salt": passData.salt,
          "nonce": await ModelPlageUser.genRandomSalt(128)
        };
        let newUser = new ModelPlageUser(data);
        let id = await newUser.update();
        if (id) {
          res.status(200).end(JSON.stringify({
            message: req.i18n.__("Password has been changed")
          }));
        } else {
          debug("erreur");
          res.status(500).end(JSON.stringify({
            message: req.i18n.__("Error while changing password")
          }));
        }
      } else {
        debug("error in changedPwd");
        res.status(500).end(JSON.stringify({
          message: req.i18n.__("You have to type the same password")
        }));
      }
    } else {
      debug("error in changedPwd");
      res.status(500).end(JSON.stringify({
        message: req.i18n.__("Error in the email")
      }));
    }
  } else {
    res.status(400).end()
  }
};
