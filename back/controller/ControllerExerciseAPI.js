const debug = require("debug")("ControllerExercise");
const ModelExercise = require("../model/ModelExercise");
const ModelSkill = require("../model/ModelSkill");
const ModelPlageUser = require("../model/ModelPlageUser");

const convertType = (data) => {
  let arr = []
  for (let key in data) {
    arr.push(data[key])
  }
  return arr
}
//Create an exercise

module.exports.create = async function (req, res) {
  debug("Create an exercise - API");

  if (!req.body || !req.body.exercise) {

    //Invalid request
    res.status(400).end();
  }

  if (req.body.exercise.template_archive != "") req.body.exercise.template_archive.data = { data: convertType(req.body.exercise.template_archive.data), type: 'Buffer' }
  if (req.body.exercise.statement_creation_script != "") req.body.exercise.statement_creation_script.data = { data: convertType(req.body.exercise.statement_creation_script.data), type: 'Buffer' }
  if (req.body.exercise.marking_script != "") req.body.exercise.marking_script.data = { data: convertType(req.body.exercise.marking_script.data), type: 'Buffer' }


  const data = {
    ex_id: undefined,
    template_statement: req.body.exercise.template_statement,
    template_archive: req.body.exercise.template_archive,
    statement_creation_script: req.body.exercise.statement_creation_script,
    marking_script: req.body.exercise.marking_script,
    state: req.body.exercise.state,
    author: req.session.user_id,
    name: req.body.exercise.name,
    locale: req.i18n.getLocale(),
    ref_id: !req.body.exercise.ref_id || req.body.exercise.ref_id < 0 ? undefined : req.body.exercise.ref_id
  };

  const exo = new ModelExercise(data);

  const exists = await ModelExercise.read(data.name); // call to DB 
  let message = "";
  if (exists) {
    message = "Impossible: an exercise with this name already exists!";
    const answer = {
      id: true,
      message: message
    };
    res.status(200).end(JSON.stringify(answer));
  } else {
    const success = await exo.save();
    console.log(`Success in creating exercise, got ex_id = ${success}`)
    if (success) {
      let res1;
      if (req.body.skills) {
        res1 = true
        await ModelSkill.delAllLinkEx(success);
        for (let i = 0; i < req.body.skills.length; i++) {
          const temp = await ModelSkill.addLinkSkillEx(
            success,
            req.body.skills[i].skill_code
          );
          if(!temp){
            res1 = false
            break
          }
        }
      } else {
        res1 = false;
      }
      if (res1) {
        message += req.i18n.__("Exercise created");
        const answer = {
          id: success,
          message: message
        };
        if (req.body.ref_id == undefined) {
          ModelExercise.refSelf(success);
        }
        res.status(200).end(JSON.stringify(answer));
      }
      
      else {
        message = "Problem in registring Skills";
        const answer = {
          id: false,
          message: message
        };
        res.status(500).end(JSON.stringify(answer));
      }
    } else {
      res.status(500).end();
    }
  }
};


//Get all exercises

module.exports.readAll = async function (req, res) {
  debug("ReadAPI all exercises");
  const tabExercise = await ModelExercise.readAll();

  for (let i = 0; i < tabExercise.length; i++) {
    let author = await ModelPlageUser.read(tabExercise[i].author)
    tabExercise[i].author = {
      user_id: author.user_id,
      lastname: author.lastname,
      firstname: author.firstname
    }
  }

  if (tabExercise) {
    res.status(200).send(JSON.stringify(tabExercise));
  } else {
    res.status(500).end();
  }
};



//Update an exercise
module.exports.update = async function (req, res) {
  debug("Updating");

  if (!req.body) {

    //Invalid request
    res.status(400).end();
  } else {

    if (req.body.exercise.template_archive != "") req.body.exercise.template_archive.data = { data: convertType(req.body.exercise.template_archive.data), type: 'Buffer' }
    if (req.body.exercise.statement_creation_script != "") req.body.exercise.statement_creation_script.data = { data: convertType(req.body.exercise.statement_creation_script.data), type: 'Buffer' }
    if (req.body.exercise.marking_script != "") req.body.exercise.marking_script.data = { data: convertType(req.body.exercise.marking_script.data), type: 'Buffer' }

    //Check if exerciseId is right
    const exercise = await ModelExercise.readById(parseInt(req.params.exerciseId));

    if (req.session.user_id != exercise.author && req.session.role_id != 1) {
      return res.status(403).end()
    }

    if (exercise) {
      const data = {
        ex_id: parseInt(req.params.exerciseId),
        template_statement: req.body.exercise.template_statement,
        template_archive: req.body.exercise.template_archive != "" ? req.body.exercise.template_archive : exercise.template_archive,
        statement_creation_script: req.body.exercise.statement_creation_script != "" ? req.body.exercise.statement_creation_script : exercise.statement_creation_script,
        marking_script: req.body.exercise.marking_script != "" ? req.body.exercise.marking_script : exercise.marking_script,
        state: req.body.exercise.state,
        author: req.body.exercise.author,
        name: req.body.exercise.name,
        locale: req.i18n.getLocale(),
        ref_id: req.body.exercise.ref_id
      };
      if (data.ref_id === -1) {
        data.ref_id = undefined;
      }
      const new_exercise = new ModelExercise(data);
      const success = await new_exercise.update();

      await ModelSkill.delAllLinkEx(req.params.exerciseId);
      for (let i = 0; i < req.body.skills.length; i++) {
        const temp = await ModelSkill.addLinkSkillEx(
          req.params.exerciseId,
          req.body.skills[i].skill_code
        );
      }

      console.log("EXERCISE\n", exercise, "\n\n");
      console.log("SUCCESS\n", success);
      if (success) {

        //Get the new exercise
        const newExercise = await ModelExercise.read(
          parseInt(req.params.exerciseId)
        );

        //Return the new exercise
        res.status(200).json(newExercise);
      } else {
        res.status(500).end();
      }
    } else {
      res.status(404).end();
    }
  }
};


// Delete an exercise

module.exports.delete = async function (req, res) {
  debug("Wanting to delete exercise "+req.params.exerciseId);
  
  // checking user is author or admin
  const user = req.session;
  debug("asked by user_id "+user.user_id)
  
  const exo = await ModelExercise.readById(req.params.exerciseId);
  if (exo) {
    debug("Exo is: "+JSON.stringify(exo)+" written by author "+exo.author)
    let deletionAllowed = false
    // A teacher can delete one of its exercises
    if (exo.author == user.user_id) {deletionAllowed = true}
    else { // an admin can delete an exercise
      const userDetail = await ModelPlageUser.read( user.user_id )
      if (userDetail.role_id == '1') {deletionAllowed = true}
    }
    if (deletionAllowed) {
      console.log("Deletion allowed")
      const res1 = await ModelSkill.delAllLinkEx(req.params.exerciseId);
      console.log(res1)
      if (res1) {
        const deleteSuccess = await ModelExercise.delete(req.params.exerciseId);
        if (deleteSuccess) {
          const answer = {
            id: deleteSuccess,
            message: "Exercise deleted"
          };
          res.status(200).end(JSON.stringify(answer));
        } else {
          const answer = {
            id: deleteSuccess,
            message: "Impossible to delete the exercise"
          };
          res.status(500).end(JSON.stringify(answer));
        }
      } else {
        res.status(500).end();
      } 
    } 
    else {
      debug("Deletion NOT allowed")
      const answer = {
        id: exo,
        message: "You're not allowed to delete this exercise"
      };
      res.status(403).end(JSON.stringify(answer));
    }
  }
  else {
    debug("Exercise to delete not found in DB")
      const answer = {
        id: exo,
        message: "Exercise to delete not found in DB"
      };
      res.status(404).end(JSON.stringify(answer));
  }
};

// Read one exercise

module.exports.read = async function (req, res) {
  debug("API Get an exercise");
  const exo = await ModelExercise.readById(req.params.exerciseId);
  if (exo) {
    if (exo.template_archive) {
      exo.template_archive = Buffer.from(exo.template_archive).toString("utf8");
    }
    if (exo.statement_creation_script) {
      exo.statement_creation_script = Buffer.from(exo.statement_creation_script).toString("utf8");
    }
    if (exo.marking_script) {
      exo.marking_script = Buffer.from(exo.marking_script).toString("utf8");
    }

    let author = await ModelPlageUser.read(exo.author)
    exo.author = {
      user_id: author.user_id,
      lastname: author.lastname,
      firstname: author.firstname
    }

    if(res !== undefined && res !== null) {
      res.status(200).end(JSON.stringify(exo));
    }
    else {
      return exo;
    }
    
  } else {
    if(res !== undefined && res !== null) {
      res.status(500).end(JSON.stringify({
        message: "ERROR : can't get this exercise"
      }));
    }
    else {
      return null;
    }
  }
};
