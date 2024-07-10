const debug = require("debug")("ControllerExerciseProduction");
const ModelExerciseProduction = require("../model/ModelExerciseProduction");
const ModelFile = require("../model/ModelFile");
const ModelStudentStatement = require("../model/ModelStudentStatement");
const archiver = require("archiver");
const streamBuffers = require("stream-buffers");

/**
 * Creates a new exercise production
 * Used when a student just submitted an answer for an exercise in a session
 *
 */
module.exports.create = async function (req, res) {
  //TODO : Find a way to test this
  debug("Creating a new Exercise Production");
  let fData;
  let arr = []
  for(let key in req.body.production_data.data){
    arr.push(req.body.production_data.data[key])
  }
  req.body.production_data.data = {data:arr, type: 'Buffer'}
  if (req.files != undefined) {
    fData = new ModelFile(req.files.production_data);
    debug("getting subm file from req.files");
  } else {
    fData = new ModelFile(req.body.production_data);
    debug("getting subm file from req.body");
  }
  debug("file submitted is " + fData.name);
  debug("Processing an exercise production:");
  let ex_id = req.body.ex_id;
  let ps_id = req.body.ps_id;
  const user = req.session;
  let user_id = user.user_id;

  const stmt = await ModelStudentStatement.read(ps_id, user_id, ex_id)
  if(stmt){
    const now = Date.now();
    const end = Date.parse(stmt.deadline_date.toString())
    if(end < now) {
      res.status(401).json({error: "Can not submit productions anymore"})
      return;
    }
  }

  //let user_id = req.body.user_id; //for testing purposes //TODO : NEEDS TO BE CHANGED LATER
  debug("exercise " + ex_id + " for user " + user_id + " in session " + ps_id);
  let today =
    new Date().getFullYear() +
    "-" +
    ("0" + (new Date().getMonth() + 1)).slice(-2) +
    "-" +
    new Date().getDate();
  debug("today = " + today);
  await ModelExerciseProduction.evaluateStudProduction(
    ps_id,
    ex_id,
    user_id,
    JSON.stringify(fData),
    async function (err, data) {
      // callback function     
      if (err) {
        debug("Error while processing exercise production. Please retry");
        res.status(500).end();
      }

      //Partie enregistrement dans la DB :
      else {
        try {
          debug("Controller got student's exercice production analysis results: " + data);
          var data = JSON.parse(data);
        } catch (error) {
          debug("Error when parsing JSON produced by script anaysis " + error);
          data = Object.assign({}, { comment: "Error in script analyzing your answer", grade: 0 });
        }
        let dataEp = {
          ep_id: undefined,
          ex_id: req.body.ex_id,
          user_id: user_id,
          comment: JSON.stringify({ log: data.comment }),
          is_final: req.body.is_final || false,
          score: data.grade || 0,
          processing_log: req.body.processing_log || "default",
          working_time: req.body.working_time || "default",
          production_data: JSON.stringify(fData),
          submissiont_date: today || "01-01-2020",
        };
        let ep = new ModelExerciseProduction(dataEp);

        // TODO Should be done before analyzing the production ? Maybe not because we need the score to save the exercise production
        let newEpId = await ep.save();
        if (newEpId) {
          debug("Successfully created a new exercise production");

          // A new production was submitted, the user skills MAY have changed
          res.status(201).json({...data, ex_id: req.body.ex_id});
        } else {
          debug("Failed to create a new exercise produciton");
          res.status(500).end();
        }
      }
    }
  ).catch((err) => {
    debug("evaluateStudProduction raised an error");
    res.status(500).send(JSON.stringify({ log: "script error" }));
  });
};

/**
 *
 * Retrieves an exercise production given its id
 */
module.exports.read = async function (req, res) {
  debug("Read an exercise production");
  const ep = await ModelExerciseProduction.read(req.params.exerciseProductionId);
  if (ep) {
    res.status(200).json(ep);
  } else {
    res.status(404).end();
  }
};

/**
 *
 * Delete an exercise production given its id
 */
module.exports.delete = async function (req, res) {
  debug("Deleting exercise production: " + req.params.exerciseProductionId);
  const success = await ModelExerciseProduction.delete(req.params.exerciseProductionId);
  if (success) {
    res.status(200).end();
  } else {
    res.status(404).end();
  }
};

/**
 *
 * Retrieve all the exercise productions submitted by a student
 */
module.exports.readStudentExerciseProductions = async function (req, res) {
  debug("Read exercise production of one student");
  const tabStu = await ModelExerciseProduction.readStuList(req.params.userId);
  if (tabStu) {
    res.status(200).json(tabStu);
  } else {
    res.status(404).end();
  }
};

/**
 *
 * Retrieve all the exercise productions related to an exercise
 */
module.exports.readExerciseExerciseProductions = async function (req, res) {
  debug("Read exercise production for one exercise");
  const tabEP = await ModelExerciseProduction.readExeList(req.params.exerciseId);
  if (tabEP) {
    res.status(200).json(tabEP);
  } else {
    res.status(404).end();
  }
};

/**
 *
 * Retrieve all the exercise productions submitted by a student and related to an exercise
 */
module.exports.readExerciseStudentExerciseProductions = async function (req, res) {
  debug("Read exercise production of one student and one exercise statement");
  const tabStuEx = await ModelExerciseProduction.readStuExList(req.params.userId, req.params.exerciseId);
  //const user = await ModelPlageUser.read(req.params.userId) May be usefull
  if (tabStuEx) {
    res.status(200).json({ tabStuEx });
  } else {
    res.status(404).end();
  }
};


module.exports.evaluate = async function (req, res) {
  let ex_id = req.body.exerciseId;
  let production_data;
  let lmsStudentStatement = {
    statement: undefined,
    archive: undefined,
  };
  if (req.files != undefined) {
    production_data = new ModelFile(req.files.production_data);
    lmsStudentStatement.archive = new ModelFile(req.files.template_archive);
    lmsStudentStatement.statement = new ModelFile(req.files.statement);
    debug("getting subm files from req.files");
  } else {
    production_data = new ModelFile(req.body.production_data);
    lmsStudentStatement.archive = new ModelFile(req.body.template_archive);
    lmsStudentStatement.statement = new ModelFile(req.body.statement);
    debug("getting subm files from req.body");
  }
  debug(
    "Submitted files are " +
      production_data.name +
      " and " +
      lmsStudentStatement.archive.name +
      " and " +
      lmsStudentStatement.statement.name
  );

  await ModelExerciseProduction.evaluateStudProductionLMS(
    ex_id,
    JSON.stringify(production_data),
    lmsStudentStatement,
    async function (err, data) {
      // callback function
      try {
        debug("Controller got student's exercice production analysis results: " + data);
        var data = JSON.parse(data);
      } catch (error) {
        debug("Error when parsing JSON produced by script anaysis " + error);
        data = Object.assign({}, { comment: "Correction script error", grade: 0 });
      }
      if (err) {
        debug("error exercise");
        res.status(500).end();
      } else {
        let evaluation = {
          score: data.grade,
          comment: data.comment,
        };
        res.status(200).json(evaluation);
      }
    }
  );
};

/**
 *
 * Creates a student statement (but only statement + archive) given an exercise id
 */
module.exports.generateStatement = async function (req, res) {
  const exercise_id = req.params.exerciseId;
  const user_id = req.session.user_id; // Don't know yet how will students coming from LMS will be identified

  await ModelStudentStatement.generateSudentStatement(
    undefined,
    exercise_id,
    undefined, //Calling with undefined because there is not SOY Session or User in LMS
    async function (dataStatement, dataArchive, err) {
      if (!err) {
        let statement = {
          statement: dataStatement,
          file: JSON.stringify(dataArchive),
        };

        //Making a compressed file containing both the statement and the archive
        let outputStreamBuffer = new streamBuffers.WritableStreamBuffer({
          initialSize: 1000 * 1024, // start at 1000 kilobytes.
          incrementAmount: 1000 * 1024, // grow by 1000 kilobytes each time buffer overflows.
        });

        let archive = archiver("tar" /*, { gzip: true }*/); //gzip doesn't work
        archive.pipe(outputStreamBuffer);

        archive.append(dataArchive.data, { name: "archive.tar.gz" });
        archive.append(dataStatement, { name: "statement.html" });

        res.attachment("student_statement.tar");
        archive.on("end", () => res.status(200).end()); //When the stream ends
        archive.pipe(res);
        archive.finalize();
      } else {
        res.status(500).end(err.toString());
      }
    }
  );
};
