"use strict";
const crypto = require("crypto");
const debug = require("debug")("ModelPlageUser");
const Model = require("./Model");
const ModelDB = require("./ModelDB");
const isEmpty = require('lodash.isempty');
const ModelExercise = require("./ModelExercise");

class ModelPlageUser extends Model {

  // Constructor
  constructor(data) {
    super();
    this.user_id = data.user_id;
    this.lastname = data.lastname;
    this.firstname = data.firstname;
    this.tdgroup = data.tdgroup;
    this.email = data.email;
    this.enabled = data.enabled;
    this.role_id = data.role_id;
    this.avatar = data.avatar;
    this.password = data.password;
    this.organization = data.organization;
    this.country = data.country;
    this.locale = data.locale;
    this.student_number = data.student_number;
    this.nonce = data.nonce;
    this.salt = data.salt;

    this.dbName = ModelPlageUser.dbName;
    this.keys = ModelPlageUser.keys;
    this.locKey = ModelPlageUser.locKey;
  }

  // Check if user is logged in. If connected return object with info, else false.
  static async isConnected( req ) {
    debug( "checking if user is connected.")
    //debug("req.session = "+JSON.stringify(req.session))
    // When coming from a post, the info/params are in body of the request (req.body)
    //debug("req.body received: "+JSON.stringify(req.body)+"\n\n")
    
    if ( (! isEmpty(req.session)) &&  req.session.user_id) {
    //if ( (req.session && req.session.user_id) || (req.body && req.body.session.user_id ) ) {
      debug(`user_id = ${req.session.user_id} found in req.session`)
      const user = {
        user_id: req.session.user_id,
        lastname: req.session.lastname,
        firstname: req.session.firstname,
        role_id: req.session.role_id
      };
      return user;
    } else { // in POST requests, user_id is somewhere in body of the request     
      if ( (! isEmpty(req.body)) &&  (! isEmpty(req.body.session)) && req.body.session.user_id) {
        //   user_id is also sometimes in req.body.user_id ! 
        //   (and additionnally in req.body.SESSION.user_id)
        debug(`user_id = ${req.body.session.user_id} found in req.body.session`)
        const user = {
          user_id: req.body.session.user_id,
          lastname: req.body.session.lastname,
          firstname: req.body.session.firstname,
          role_id: req.body.session.role_id //firstname
        };
        return user;
      }  
      else {
        debug("user_id not found") 
        debug("\n\n\t\t User NOT CONNECTED !!!\n\n")
        return false;
      }
    }
  }


  static async getAllUsers() {
    debug('Get all users')
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      let sql = 'SELECT * FROM userplage up, userrole ur WHERE up.role_id=ur.role_id;'
      let res = await client.query(sql)
      return res.rows
    } catch (err) {
      debug('cannot get all users: ' + err.stack)
      return false
    } finally {
      client.release()
    }
  }


  static async updateRole(user_id,role_id) {
    debug('Update Roles')
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "UPDATE " + ModelPlageUser.dbName + " SET role_id=$2::int WHERE user_id=$1::int;";
      await client.query(sql, [user_id,role_id]);
      return true;
    } catch (err) {
      debug('Update roles : ' + err.stack)
      return false
    } finally {
      client.release()
    }
  }
  
  static async updateNonce(user_id,nonce) {
    debug('Update Nonce')
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "UPDATE " + ModelPlageUser.dbName + " SET nonce=$2::varchar WHERE user_id=$1::int;";
      await client.query(sql, [user_id,nonce]);
      return true;
    } catch (err) {
      debug('Update nonce : ' + err.stack)
      return false
    } finally {
      client.release()
    }
  }

  
  static async activate(nonce) {
    debug("Activate an user account with nonce");
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "UPDATE "+ ModelPlageUser.dbName +" SET nonce = NULL, enabled = true WHERE nonce = $1::varchar;";
      await client.query(sql, [nonce]);
      debug("activate : SUCCESS");
      return true;
    } catch (err) {
      debug("activate : " + err.stack);
      return false;
    } finally {
      client.release();
    }
  }

  static async checkNonce(nonce) {
    debug("Check if nonce valid");
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "SELECT user_id FROM " + ModelPlageUser.dbName + " WHERE nonce=$1::varchar;";
      const res = await client.query(sql, [nonce]);
      if (res.rows[0]) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      debug("checkNonce : " + err.stack);
      return false;
    } finally {
      client.release();
    }
  }

  static async getUserByNonce(nonce) {
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "SELECT * FROM " + ModelPlageUser.dbName + " WHERE nonce=$1::varchar;";
      const res = await client.query(sql, [nonce]);
      if (res.rows[0]) {
        const user = new ModelPlageUser(res.rows[0]);
        return user;
      } else {
        return "none";
      }
    } catch (err) {
      debug("getUserByNonce : " + err.stack);
      return false;
    } finally {
      client.release();
    }
  }

  static async checkEmailinDB(email) {
    debug("Check if the e-mail is already in database");
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "SELECT user_id FROM UserPlage WHERE email=$1::varchar;";
      const user = await client.query(sql, [email.toLowerCase()]);
      if (user.rows[0] != undefined) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      debug("checkEmailinDB: " + err.stack);
      return false;
    } finally {
      client.release();
    }
  }

  static async genRandomSalt(length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);
  }

  static async saltPepperHashPassword(password) {
    const salt = await ModelPlageUser.genRandomSalt(16);
    const passwordData = hashSHA512(password, salt);
    return passwordData;
  }

  static async logPlage(email, password) {
    debug('Login into Plage')
    let user = await getUserByEmail(email)
    if (!user) {
        debug('User not found !!!!!!')
        return false
    }
    if (user == 'none') {
        return 'none'
    }
    
    let goodPwd = await comparePassword(password, user.salt, user.password)
    if (goodPwd) {
        if (user.enabled) {
            return user
        } else {
            return 'disabled'
        }
    } else {
        return 'none'
    }
  }

  static async getSkills(user_id, locale){
    const sql = `
      SELECT DISTINCT ep.ex_id AS ex_id, s.skill_code AS skill_code, s.locale AS locale, s.name AS skill_name, s.ref_code AS ref_code
      FROM exerciseproduction ep
      JOIN exerciselevel el ON el.ex_id = ep.ex_id
      JOIN skill s ON s.skill_code = el.skill_code
      WHERE ep.user_id = $1 AND ep.score >= 50
    `
    const client = await ModelDB.connect_to_db_from_pool();
    let result = await client.query(sql, [user_id])
    
    if(result && result.rows){
      let skills = {}

      for (let i = 0; i < result.rows.length; i++) {
        let origin_row = result.rows[i];
        let translated_row
        
        if(origin_row.locale != locale){
          console.log(origin_row)
          if(origin_row.locale == "en"){
            let tmp = await client.query("SELECT skill_code, name AS skill_name FROM skill WHERE ref_code = $1 AND locale = $2", [origin_row.skill_code, locale])
            if(tmp && tmp.rows && tmp.rows.length > 0) translated_row = tmp.rows[0]
          } else {
            console.log(origin_row.locale)
            let tmp = await client.query("SELECT skill_code, name AS skill_name FROM skill WHERE skill_code = $1 AND locale = $2", [origin_row.ref_code, locale])
            if(tmp && tmp.rows && tmp.rows.length > 0) translated_row = tmp.rows[0]
          }
          console.log(translated_row)
        }

        const row = translated_row ? translated_row : origin_row

        if(!skills[row.skill_code]) skills[row.skill_code] = {skill_code: 0, name: "", exercises: []}
        skills[row.skill_code].name = row.skill_name
        skills[row.skill_code].skill_code = row.skill_code

        let ex = await ModelExercise.readById(origin_row.ex_id)
        ex = {
          ex_id: ex.ex_id,
          name: ex.name
        }
        skills[row.skill_code].exercises.push(ex)
      }

      return Object.values(skills)
    } else {
      return undefined
    }
  }

  static async getUserRole(id) {
    //debug(`Trying to fetch the name of the role for user ${id}`)
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      let sql = 'SELECT userrole.name FROM '+ModelPlageUser.dbName+', userrole WHERE userplage.user_id = $1 AND userplage.role_id = userrole.role_id;'
      let res = await client.query(sql, [id])
      if (res.rows[0].name) {
        return res.rows[0].name
      } else {
        return 'none'
      }
    } catch (err) {
      debug('getUserRole : ' + err.stack)
      return false
    } finally {
      client.release()
    }
  }

  static async getAllRoles() {
    debug('Get all roles')
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      let sql = 'SELECT * FROM userrole;'
      let res = await client.query(sql)
      if (res.rows) {
        return res.rows 
      }
    } catch (err) {
      debug('get All Roles  : ' + err.stack)
      return false
    } finally {
      client.release()
    }
  }

  static async getUserByEmailId(email) {
    debug("Get a user by her/his email");
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "SELECT * FROM "+ModelPlageUser.dbName+" WHERE email=$1;";
      const res = await client.query(sql, [email]);
      if (res.rows[0]) {
        const user = new ModelPlageUser(res.rows[0]);
        debug('user recupere')
        return user;
      } else {
        return "none";
      }
    } catch (err) {
      debug("getUserByEmailId : " + err.stack);
      return false;
    } finally {
      client.release();
    }
  }

}




async function comparePassword(password, salt, hash) {
  debug('Check if password OK')
  let passwordData = await hashSHA512(password, salt)
  if (passwordData.passwordHash === hash) {
    return true
  } else {
    return false;
  }
}
async function hashSHA512(password, salt) {
  const hash = crypto.createHmac("sha512", salt + ModelPlageUser.pepper);
  hash.update(password);
  return {
    salt: salt,
    passwordHash: hash.digest("hex")
  };
}

async function getUserByEmail(email) {
  debug("Get a user by her/his email");
  const client = await ModelDB.connect_to_db_from_pool();
  try {
    const sql = "SELECT * FROM "+ModelPlageUser.dbName+" WHERE email=$1;";
    const res = await client.query(sql, [email.toLowerCase()]);
    if (res.rows[0]) {
      const user = new ModelPlageUser(res.rows[0]);
      return user;
    } else {
      return "none";
    }
  } catch (err) {
    debug("getUserByEmail : " + err.stack);
    return false;
  } finally {
    client.release();
  }
}

async function isEnabled(user_id) {
  debug("Check if an account is activated");
  const client = await ModelDB.connect_to_db_from_pool();
  try {
    const sql = "SELECT enabled WHERE user_id=$1::int;";
    const res = await client.query(sql, [user_id]);
    if (res.rows[0]) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    debug("isEnabled :" + err.stack);
    return false;
  } finally {
    client.release();
  }
}

ModelPlageUser.dbName = "UserPlage";
ModelPlageUser.keys = [
  ["user_id", "int"],
  ["lastname", "varchar"],
  ["firstname", "varchar"],
  ["tdgroup", "varchar"],
  ["email", "varchar"],
  ["enabled", "boolean"],
  ["role_id", "int"],
  ["avatar", "bytea"],
  ["password", "varchar"],
  ["organization", "varchar"],
  ["country", "varchar"],
  ["locale", "loc"],
  ["student_number", "varchar"],
  ["nonce", "varchar"],
  ["salt", "varchar"]
];
ModelPlageUser.locKey = undefined;
ModelPlageUser.pepper = "4lW415 n33D c0Ff3";

module.exports = ModelPlageUser;