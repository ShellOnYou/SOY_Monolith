const debug = require("debug")("ControllerStudentStatementAPI");
const Model = require("../model/Model");
const ModelExercise = require("../model/ModelExercise");
const ModelPlageSession = require("../model/ModelPlageSession");
const ModelStudentStatement = require("../model/ModelStudentStatement");
const ModelSequence = require("../model/ModelSequence")
const ModelExerciseProduction = require("../model/ModelExerciseProduction")

module.exports.create = async function (req, res) {
  debug("Create a StudentStatement");
  let data;
  const session = await ModelPlageSession.read(req.params.businessSessionId)
  const ex = await ModelExercise.readById(req.params.exerciseId)
  if (req.params) {
    data = {
      ps_id: req.params.businessSessionId,
      user_id: req.params.userId,
      ex_id: req.params.exerciseId,
      availability_date: session.start_date,
      deadline_date: session.end_date,
      statement: ex.template_statement,
      is_sended: false,
      file: ex.template_archive
    };
  } else {
    data = {
      ps_id: req.body.ps_id,
      user_id: req.body.user_id,
      ex_id: req.body.ex_id,
      availability_date: req.body.availability_date,
      deadline_date: req.body.deadline_date,
      statement: req.body.statement,
      is_sended: req.body.is_sended,
      file: req.body.file,
    };
  }

  
  const studentStatement = new ModelStudentStatement(data);

  let seqs = await ModelSequence.read(session.seq_id)
  seqs = seqs.sort((a, b) => Number(a.rank) - Number(b.rank))

  if(session.is_timed){
    // Do not allow creation if its not the correct day
    const now = Date.now();
    const start = Date.parse(session.start_date)
    const end = Date.parse(session.end_date) + 86400000
    if(start <= now && now <= end){
      let dist = now/86400000 - start/86400000
      let day = Math.floor(dist) + 1
      
      for(let i = 1 ; i < seqs.length ; i++){
        if(seqs[i].ex_id === ex.ex_id){
          if(seqs[i].rank === day){
            data.availability_date = start+(day*86400000)
            data.deadline_date = start+((day+1)*86400000)
          }else{
            res.status(500).json({error: "This is not the right day to do this exercise"})
            return;
          }
        }
      }

    }else{
      if(start < now) res.status(500).json({error: "Session is already over"})
      else res.status(500).json({error: "Session is not yet available"})
      return;
    }
    

  }else{
    // Test if the student got a good score in the previous exercise of the sequence
    for(let i = 1 ; i < seqs.length ; i++){
      if(seqs[i].ex_id === ex.ex_id){
        const eps = await ModelExerciseProduction.readStuExList(req.params.userId, seqs[i-1].ex_id)
        let max = 0;
        for(let j = 0 ; j < eps.length ; j++){
          if(Number(eps[j].score) > max ) max = Number(eps[j].score)
        }
        if(Number(seqs[i-1].min_rating) > max) {
          res.status(500).json({error: "Insufficient score on the previous exercise"});
          return;
        }
      }
    }
  }
  


  const save = await studentStatement.save();
  if (save) {
    const createdStudentStatement = await ModelStudentStatement.read(
      data.ps_id,
      data.user_id,
      data.ex_id
    );
    createdStudentStatement.file = JSON.parse(createdStudentStatement.file)
    res.status(201).json(createdStudentStatement);
  } else {
    res.status(500).end();
  }
};

module.exports.read = async function (req, res) {
  debug("Read a StudentStatement by ps_id, user_id and ex_id");
  const studentStatement = await ModelStudentStatement.read(
    req.params.businessSessionId,
    req.params.userId,
    req.params.exerciseId
  );
  if (studentStatement) {
    studentStatement.file = JSON.parse(studentStatement.file)
    res.status(200).json(studentStatement);
  } else {
    //res.status(500).end();
    this.create(req, res)
  }
};

module.exports.update = async function (req, res) {
  debug("Update a StudentStatement");

  if (!req.body) {
    //Bad request
    res.status(400).end();
  } else {
    //Check if ids are right
    const studentStatement = await ModelStudentStatement.read(
      req.params.businessSessionId,
      req.params.userId,
      req.params.exerciseId
    );

    if (studentStatement) {
      const data = {
        ps_id: req.params.businessSessionId,
        user_id: req.params.userId,
        ex_id: req.params.exerciseId,
        availability_date: req.body.availability_date,
        deadline_date: req.body.deadline_date,
        is_sended: req.body.is_sended,
        statement: req.body.statement,
        file: req.body.file,
      };
      const studentStatementUpdated = new ModelStudentStatement(data);
      const success = await studentStatementUpdated.update();
      if (success) {
        //Get the new studentStatement
        const newStudentStatement = await ModelStudentStatement.read(
          req.params.businessSessionId,
          req.params.userId,
          req.params.exerciseId
        );
        //Return the new studentStatement
        res.status(200).json(newStudentStatement);
      } else {
        res.status(500).end();
      }
    } else {
      //Not found
      res.status(404).end();
    }
  }
};
