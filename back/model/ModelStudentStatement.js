"use strict";
const axios = require("axios");
//const ConfServ = require("../config/ConfServ");
const debug = require("debug")("ModelStudentStatement");
const fs = require("fs");
const Model = require("./Model");
const ModelDB = require("./ModelDB");
const ModelFile = require("./ModelFile");
const PythonShell = require("python-shell");
const rimraf = require("rimraf");
const sha1 = require("sha1");

const ControllerExerciseAPI = require("../controller/ControllerExerciseAPI");

class ModelStudentStatement extends Model {
  // Constructor
  constructor(data) {
    super();
    this.ps_id = data.ps_id;
    this.user_id = data.user_id;
    this.ex_id = data.ex_id;
    this.availability_date = data.availability_date;
    this.deadline_date = data.deadline_date;
    

    this.is_sended = data.is_sended;
    this.statement = data.statement;
    this.file = data.file;

    this.dbName = ModelStudentStatement.dbName;
    this.keys = ModelStudentStatement.keys;
    this.locKey = ModelStudentStatement.locKey;
  }

  static async read(ps_id, user_id, ex_id) {
    debug("Trying to read ONE student statement");
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      let sql =
        "SELECT * FROM " +
        ModelStudentStatement.dbName +
        " WHERE user_id=$1::int AND ex_id=$2::int AND ps_id=$3::int;";
      let res = await client.query(sql, [user_id, ex_id, ps_id]);
      debug("read : SUCCESS");
      return res.rows[0];
    } catch (err) {
      debug("read : " + err.stack);
      return false;
    } finally {
      client.release();
    }
  }

  // Update
  async update() {
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      let sql = "UPDATE " + this.dbName + " SET ";
      const values = new Array();
      let j = 1;
      for (let i = 1; i < this.keys.length; i++) {
        const newValue = this[this.keys[i][0]];
        if (newValue !== undefined) {
          //If newValue is not undefined AND not null, then :
          if (j !== 1) {
            sql += ", ";
          }
          sql += this.keys[i][0] + " = $" + j;
          j++;
          values.push(newValue);
        }
      }
      values.push(this[this.keys[0][0]]);
      sql += " WHERE ps_id = $" + j + " AND user_id = $1 AND ex_id = $2;";
      let updated = await client.query(sql, values);
      debug("update : SUCCESS");
      return true;
    } catch (err) {
      debug("update : " + err.stack);
      return false;
    } finally {
      client.release();
    }
  }

  // Renvoie le statement personnalisé d'un étudiant ET pose sur le disque l'archive question associée
  static async getStatement(ps_id, ex_id, user_id, callback) {
    debug("Chemin du process " + process.cwd());
    debug(user_id);
    //debug(fs.readFile(path.resolve(__dirname, 'settings.json'), 'UTF-8', callback))
    const studentStatement = await this.read(ps_id, user_id, ex_id);
    if (studentStatement) {
      //debug("file = "+JSON.parse(studentStatement.file).data.data)
      // Pose l'archive dans le system de fichier dans un dossier de nom random
      // (pour que l'étudiant puisse la télécharger ensuite depuis la page de l'énoncé)
      let fileName = "archive.tar.gz";
      let randomFolderName = sha1("" + ps_id + "" + user_id + "" + ex_id);
      let archivePath = "static/files/" + randomFolderName + "/";

      fs.mkdir(archivePath, { recursive: true }, function (err) {
        if (!err) {
          archivePath += fileName;
          fs.writeFile(archivePath, Buffer.from(JSON.parse(studentStatement.file).data.data), function (err) {
            if (!err) {
              debug("archive file put in " + archivePath);
              callback(studentStatement.statement, randomFolderName + "/" + fileName);
            } else {
              debug(err);
              callback(false);
            }
          });
        }
      });
    }
  }

  static async getAllUserStatement(user_id) {
    //debug('Reading all')
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      let sql =
        "SELECT * FROM " +
        ModelStudentStatement.dbName +
        " S,exercise E WHERE S.ex_id=E.ex_id AND user_id=$1::int;";
      let res = await client.query(sql, [user_id]);
      debug("read : SUCCESS");
      return res.rows;
    } catch (err) {
      debug("read : " + err.stack);
      return false;
    } finally {
      client.release();
    }
  }

  static async getAllStatement() {
    debug("Reading One");
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      let sql = "SELECT * FROM " + ModelStudentStatement.dbName;
      let res = await client.query(sql);
      debug("read : SUCCESS");
      return res.rows;
    } catch (err) {
      debug("read : " + err.stack);
      return false;
    } finally {
      client.release();
    }
  }

  static async generateSudentStatement(ps_id, ex_id, user_id, callback) {
    if (ps_id && user_id) {
      this.generateStatementPy(ps_id, ex_id, user_id, function (success, err, seed) {
        if (success) {
          debug("generateStudentStatementPy succeeded");
          debug("ps_id=" + ps_id);
          const path = "/storage-fs/" + ps_id + "/" + user_id + "/" + ex_id + "/" + seed + "/files/";
          fs.readFile(path + "statement.html", function (err, dataStatement) {
            if (!err) {
              fs.readFile(path + "archive.tar.gz", function (err, dataArchive) {
                if (!err) {
                  fs.stat(path + "archive.tar.gz", function (err, stat) {
                    if (!err) {
                      debug("SUCCESS");
                      const mArchive = new ModelFile({
                        name: "archive.tar.gz",
                        size: stat.size,
                        data: dataArchive,
                        md5: undefined,
                      });
                      // callback inserts the generated statement+archive in DB
                      callback(dataStatement, mArchive, undefined);
                      // remove files from fs
                      rimraf("/storage-fs/" + ps_id + "/" + user_id + "/" + ex_id, function (err) {
                        if (err) {
                          debug(err);
                        }
                        debug("file purge done");
                      });
                    } else {
                      debug("Error #1 in generateStudentStatement : " + err);
                      callback(undefined, undefined, err);
                    }
                  });
                } else {
                  debug("Error #2 in generateStudentStatement : " + err);
                  callback(undefined, undefined, err);
                }
              });
            } else {
              debug("generateStudentStatement : " + err);
              callback(undefined, undefined, err);
            }
          });
        } else {
          debug("generateStudentStatement : " + err);
          callback(undefined, undefined, err);
        }
      });
    } else {
      //When we call this from LMS (not linked to any session and user)
      this.generateStatementPy(undefined, ex_id, undefined, function (success, err, seed) {
        if (success) {
          debug("generateStudentStatementPy succeeded");
          debug("ps_id=" + ps_id);
          const path = "/storage-fs/lms-session/" + ex_id + "/" + seed + "/files/";
          fs.readFile(path + "statement.html", function (err, dataStatement) {
            if (!err) {
              fs.readFile(path + "archive.tar.gz", function (err, dataArchive) {
                if (!err) {
                  fs.stat(path + "archive.tar.gz", async function (err, stat) {
                    if (!err) {
                      debug("generateStudentStatement : SUCCESS");
                      const mArchive = new ModelFile({
                        name: "archive.tar.gz",
                        size: stat.size,
                        data: dataArchive,
                        md5: undefined,
                      });
                      //Callback let the client download the files
                      await callback(dataStatement, mArchive, undefined, path);
                      // remove files from fs
                      rimraf("/storage-fs/lms-session/" + ex_id + "/" + seed, function (err) {
                        if (err) {
                          debug(err);
                        }
                        debug("file purge done");
                      });
                    } else {
                      debug("Error #1 in generateStudentStatement : " + err);
                      callback(undefined, undefined, err);
                    }
                  });
                } else {
                  debug("Error #2 in generateStudentStatement : " + err);
                  callback(undefined, undefined, err);
                }
              });
            } else {
              debug("generateStudentStatement : " + err);
              callback(undefined, undefined, err);
            }
          });
        } else {
          debug("generateStudentStatement : " + err);
          callback(undefined, undefined, err);
        }
      });
    }
  }

  // Generate a student statement by calling the python statement generator (working from a common statement)
  // As output, it creates a 'files' subfolder containing archive.tar.gz and common_statement.html
  static async generateStatementPy(ps_id, ex_id, user_id, callback) {
    debug("Generate test statement");

    //let exercise = await axios.get(process.env.PLAGE_ENV + "API/exercise/" + ex_id); // Removed because the monolith should not send reflexive HTTP requests
    let req = {}; req.params = {}; req.params.exerciseId = ex_id;
    const exercise = await ControllerExerciseAPI.read(req, null);
    if(exercise != null) {

      exercise = exercise.data;
      const fSCS = await JSON.parse(exercise.statement_creation_script);
      const fTA = await JSON.parse(exercise.template_archive);
      const fShtml = exercise.template_statement;
      const rndToday = new Date().getTime();
      let path;
      let seed;
      if (typeof ps_id !== "undefined" && typeof user_id !== "undefined") {
        //Regular behavior
        path = "/storage-fs/" + ps_id + "/" + user_id + "/" + exercise.ex_id + "/" + rndToday + "/";
        seed = rndToday;
      } else {
        //Modified behavior (when route called by LMS user that is unknown by SOY)
        const rand = Math.random().toString(36).substring(2); //Generate a random identifer
        path = "/storage-fs/lms-session/" + exercise.ex_id + "/" + rndToday + "/" + rand + "/";
        seed = rndToday + "/" + rand;
      }

      fs.mkdir(path, { recursive: true }, function (err) {
        if (!err) {
          fs.writeFile(path + "generate_statement.py", Buffer.from(fSCS.data), function (err) {
            if (!err) {
              fs.writeFile(path + "archive.tar.gz", Buffer.from(fTA.data), function (err) {
                if (!err) {
                  fs.writeFile(path + "common_statement.html", fShtml, function (err) {
                    if (!err) {
                      fs.copyFile(
                        __dirname + "/../lib/Python/plageLib.py",
                        path + "plageLib.py",
                        function (err) {
                          if (!err) {
                            const py_script = "generate_statement.py"; // fSCS.name; <- from DB, the name when upoloaded from teacher's computer
                            const options = {
                              mode: "text",
                              pythonPath: "/usr/bin/python",
                              pythonOptions: ["-u"], // Force stdin, stdout and stderr to be totally unbuffered.  On systems where it matters, also put stdin, stdout and stderr in binary mode.
                              scriptPath: path,
                              args: 1,
                            };

                            debug("Running python script : " + py_script + " ...");
                            PythonShell.run(py_script, options, function (err, results) {
                              if (!err) {
                                fs.unlink(path + "generate_statement.py", function (err) {
                                  if (err) {
                                    throw err;
                                  }
                                });
                                fs.unlink(path + "archive.tar.gz", function (err) {
                                  if (err) {
                                    throw err;
                                  }
                                });
                                fs.unlink(path + "common_statement.html", function (err) {
                                  if (err) {
                                    throw err;
                                  }
                                });
                                debug("Generate test statement done");
                                callback(true, undefined, seed);
                              } else {
                                debug(err);
                                callback(false, err, undefined);
                              }
                            });
                          } else {
                            debug(err);
                            callback(false, err, undefined);
                          }
                        }
                      );
                    } else {
                      debug(err);
                      callback(false, err, undefined);
                    }
                  });
                } else {
                  debug(err);
                  callback(false, err, undefined);
                }
              });
            } else {
              debug(err);
              callback(false, err, undefined);
            }
          });
        } else {
          debug(err);
          callback(false, err, undefined);
        }
      });
    }
    else {
      debug("Got an exercise equal to null");
      callback(new Error("Cannot get the Exercice"),undefined);
    }
      
  }

  // ------------------------------------------------------------------------------------
  //   Methods for the test mode
  // ------------------------------------------------------------------------------------
  static async getTestStatement(ex_id, user_id, callback) {
    // il faudra passer le ps_id aussi car le chemin :des fichiers est : /storage_fs/ps_id/user_id/ex_id
    const path = "/storage-fs/" + user_id + "/test/" + ex_id + "/files/statement.html";
    fs.readFile(path, function (err, data) {
      if (!err) {
        callback(data);
      } else {
        debug(err);
        callback(false);
      }
    }); // ??? ';' neeeded ???
  }

  static async sendTestArchive(ex_id, user_id, callback) {
    const path = "/storage-fs/" + user_id + "/test/" + ex_id + "/files/archive.tar.gz";
    fs.readFile(path, function (err, data) {
      if (err) {
        throw err;
      }
      callback(data); // ??? ';' neeeded ???
    });
  }

  static async generateTestStatementPy(ex_id, user_id, callback) {
    this.generateStatementPy(ex_id, user_id, function (success, err, seed) {
      if (success) {
        let path1 = "/storage-fs/" + user_id + "/test/" + ex_id + "/" + seed + "/files/";
        let path2 = "/storage-fs/" + user_id + "/test/" + ex_id + "/files/";
        fs.mkdir(path2, { recursive: true }, function (err) {
          if (!err) {
            fs.copyFile(path1 + "statement.html", path2 + "statement.html", function (err) {
              if (!err) {
                fs.copyFile(path1 + "archive.tar.gz", path2 + "archive.tar.gz", function (err) {
                  if (!err) {
                    rimraf("/storage-fs/" + user_id + "/test/" + ex_id + "/" + seed, function (err) {
                      if (err) {
                        debug(err);
                      }
                      debug("purge done");
                    });
                    callback(true, undefined);
                  } else {
                    debug(err);
                    callback(false, err);
                  }
                });
              } else {
                debug(err);
                callback(false, err);
              }
            });
          } else {
            callback(false, err);
          }
        });
      } else {
        callback(false, err);
      }
    });
  }
}

ModelStudentStatement.dbName = "StudentStatement";
ModelStudentStatement.keys = [
  ["ps_id", "int"],
  ["user_id", "int"],
  ["ex_id", "int"],
  ["availability_date", "date"],
  ["deadline_date", "date"],
  ["is_sended", "boolean"],
  ["statement", "text"],
  ["file", "bytea"],
];
ModelStudentStatement.locKey = undefined;

module.exports = ModelStudentStatement;
