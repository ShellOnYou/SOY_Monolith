"use strict";
const crypto = require("crypto");
const debug = require("debug")("ModelSessionStore");
const Model = require("./Model");
const ModelDB = require("./ModelDB");


class ModelSessionStore extends Model {

    // Constructor
    constructor(data) {
      super();
      this.user_id = data.user_id;
      this.lastname = data.lastname;
      this.firstname = data.firstname;
      this.role_id = data.role_id;
    }

    
    static async getUserSession() {
        debug('Get user session')
        const client = await ModelDB.connect_to_db()
        try {
          // get the json info for this user from the session store
          let sql = 'SELECT sess FROM session'
          let res = await client.query(sql)
            let user ={
                user_id: res.rows[0].user_id,
                lastname:res.rows[0].lastname,
                firstname:res.rows[0].firstname,
                role_id:res.rows[0].role_id
            }
          return user
        } catch (err) {
          debug('get All users : ' + err.stack)
          return false
        } finally {
          client.end()
        }
      }
}


module.exports = ModelSessionStore;