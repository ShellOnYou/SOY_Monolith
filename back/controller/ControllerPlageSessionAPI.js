const debug = require("debug")("ControllerPlageSession");
const ModelPlageSession = require("../model/ModelPlageSession");
const ModelExercise = require("../model/ModelExercise");
const ModelSequence = require("../model/ModelSequence");
const ModelPlageUser = require("../model/ModelPlageUser");
const ModelExerciseProduction = require("../model/ModelExerciseProduction");
const { upperFirst } = require("lodash");

// Get all business sessions

module.exports.readAll = async function (req, res) {
  debug("ReadAPI all business session");
  const tabSession = await ModelPlageSession.readAll();

    
  for (let i = 0; i < tabSession.length; i++) {
    let author = await ModelPlageUser.read(tabSession[i].author)
    tabSession[i].author = {
      user_id: author.user_id,
      lastname: author.lastname,
      firstname: author.firstname
    }
  }

  if (tabSession) {
    res.status(200).send(JSON.stringify(tabSession));
  } else {
    res.status(500).end();
  }
};

// Get one session

module.exports.read = async function (req, res) {
  debug("ReadAPI get a business session");
  const session = await ModelPlageSession.read(req.params.sessionId);
  session.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  if (session) {
    debug("Session recup de BD: " + session);
    debug("Session recup de BD: " + JSON.stringify(session));
    res.status(200).send(JSON.stringify(session));
  } else {
    res.status(500).end();
  }
};

module.exports.getStats = async function (req, res) {
  debug("ReadAPI get a business session stats");
  const toreturn = {
    session: "",
    exercises: []
  }

  toreturn.session = await ModelPlageSession.read(req.params.sessionId);
  toreturn.session.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  if(req.session.user_id != toreturn.session.author){
    res.status(403)
    res.end("Access denied")
    return
  }

  toreturn.exercises = await getExListForSession(req.params.sessionId);
  for (let i = 0; i < toreturn.exercises.length; i++) {
    const productions = await ModelExerciseProduction.readExeList(toreturn.exercises[i].ex_id)

    let user_prods = {}
    for (let j = 0; j < productions.length; j++) {
      if(!user_prods[productions[j].user_id]){
        let user = await ModelPlageUser.read(productions[j].user_id)
        user_prods[productions[j].user_id] = {
          user: {
            user_id: user.user_id,
            lastname: user.lastname,
            firstname: user.firstname
          },
          stats: {
            min: 100,
            max: 0,
            round: 0
          },
          productions: []
        }
      }
      user_prods[productions[j].user_id].productions.push(productions[j]);
    }

    for (const user_id in user_prods) {
      if (Object.hasOwnProperty.call(user_prods, user_id)) {
        let sum = 0
        for (let index = 0; index < user_prods[user_id].productions.length; index++) {
          const score = Number(user_prods[user_id].productions[index].score)
          if(score < user_prods[user_id].stats.min) user_prods[user_id].stats.min = score
          if(score > user_prods[user_id].stats.max) user_prods[user_id].stats.max = score
          sum += score
        }

        user_prods[user_id].stats.round = Math.round(sum / user_prods[user_id].productions.length * 100) / 100
      }
    }

    toreturn.exercises[i].user_productions = user_prods
    toreturn.exercises[i].stats = await ModelExerciseProduction.getStats(toreturn.exercises[i].ex_id)
    toreturn.exercises[i].stats = toreturn.exercises[i].stats[0]
  }

  if (toreturn.session) {
    res.status(200).send(JSON.stringify(toreturn));
  } else {
    res.status(500).end();
  }
}

// Create a business session

module.exports.create = async function (req, res) {
  debug("Create a session - API");
  // TO DO: at session creation time, check that a timed session is opened #days >= #exercises
  const dateOK = await checkDate(req.body.start_date, req.body.end_date);
  const user = req.session;
  let sequence = await ModelSequence.read(req.body.seq_id)
  if (dateOK != true) {
    res.status(500).end(JSON.stringify({
      log: req.i18n.__(dateOK)
    }));
    return;
  }
  const data = {
    ps_id: undefined,
    p_id: sequence[0].p_id,
    name: req.body.name,
    secret_key: req.body.secret_key,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    author: user.user_id || 1,
    description: req.body.description,
    universe: req.body.universe,
    seq_id: req.body.seq_id,
    is_timed: req.body.is_timed || false
  };

  const session = new ModelPlageSession(data);
  const idSession = await session.save();

  const author = await ModelPlageUser.read(data.author)
  data.author = {user_id: author.user_id, firstname: author.firstname, lastname: author.lastname}
  data.ps_id = idSession

  res.status(200).end(JSON.stringify({
    session: data,
    log: req.i18n.__("Session created")
  }));
};


async function checkDate(startDate, endDate) {
  const today = new Date().getTime();
  const sDate = new Date(startDate).getTime();
  const eDate = new Date(endDate).getTime();

  if (eDate - today <= 0) {
    return "End date is before today";
  }

  if (eDate - sDate <= 0) {
    return "Start date is after end date";
  }

  return true;
}


// Update a business session

module.exports.update = async function (req, res) {
  debug("Updating");

  if ( (new Date(req.body.end_date)).getTime() < (new Date(req.body.start_date)).getTime() ) {
    res.status( 400 ).end(JSON.stringify({
      log: req.i18n.__("Session cannot end before starting!")
    }));
    return false; // necessary, otherwise exec next instructions 
  }

    // adjust checkbox input: when selected, browser returns "on" instead of true, 
    //     if unchecked then it is simply absent from the received form data!
    if ('is_timed' in req.body) {
      if (req.body.is_timed=="on") {req.body.is_timed=true}
    }
    else { req.body.is_timed = false }

  debug(`Update request in req.body = ${JSON.stringify(req.body)}`)

  // TODO: this part should be a same transaction to avoid concurrent conflicting updates of this session:
  // add etag field in db table and receive it here from the view then 
  let ps_id = req.body.ps_id
  const db_session = await ModelPlageSession.read(ps_id);
  //debug(`db_session.start_date ${db_session.start_date}`)
  //debug(`db_session.start_date.getTime() ${db_session.start_date.getTime()}`)

  let data = db_session; // starting from info in db avoiding forgery)

  // Fields that can always be modified:  
  // (warning: we don't change the author of the session)
  data.description = req.body.description
  data.name = req.body.name
  data.secret_key = req.body.secret_key
  //debug(`after allowed updates, data= ${JSON.stringify(data)}`)


  // If session already started, only some info can be changed:
  const today = new Date();
  if ( today.getTime() < (new Date(db_session.start_date)).getTime()) {
    data.start_date = req.body.start_date
    data.end_date = req.body.end_date
    data.seq_id = req.body.seq_id
    if ('is_timed' in req.body) {data.is_timed = req.body.is_timed} // if not checkd, not returned by front
    debug(`Some updates are ok because session not already started. data = ${JSON.stringify(data)}`)
  }
  else { debug('Note: updating some fields is not allowed as session already started'); }

  // If instructor wants to postpone closing date: this is always fine
  if ( (new Date(req.body.end_date)).getTime() > (new Date(db_session.end_date)).getTime()) {
    data.end_date = req.body.end_date
    debug('asking to postpone session end date')
  }
  else { 
    if ( (new Date(req.body.end_date)).getTime() < (new Date(db_session.end_date)).getTime() ) {
    debug('making end_date earlier is not allowed as session end date can only be postponed'); }
    else { debug('not asking to change end date') }
  }
  let up_session = new ModelPlageSession(data)
  //debug(`will ask update session with data=${JSON.stringify(data)} `)
  const success = await up_session.update();
  if (success == true) { 
    debug('UPDATE ACCEPTED'); 
    const partial_update = isPartialUpdate(req.body,data)
    let message
    if (partial_update) {
      debug('update is partial')
      message = "Warning: session only partially updated!"
    } 
    else {message="Session fully updated" ; debug('Update is complete')}

    const new_session = await ModelPlageSession.read(ps_id)
    let author = await ModelPlageUser.read(new_session.author)
    new_session.author = {
      user_id: author.user_id,
      lastname: author.lastname,
      firstname: author.firstname
    }
    res.status( 200 ).end(JSON.stringify({
      partial: partial_update,
      log: req.i18n.__(message),
      session: new_session
    })); 
    return true; // necessary, otherwise exec next instructions 
  }
  else {
    debug('UPDATE DENIED');
    res.status( 409 ).end(JSON.stringify({log: req.i18n.__("Session cannot be updated!")})); return false 
  }
};

// Chekcs whether an update that was asked (req.body from form of front) has been completely given to DB or not
// (depending on dates the back could ask to perform only part of the asked updates)
function isPartialUpdate(reqBody, sentToDB) {
  // check if full or only partial update
  debug(`\n\nCOMPARING reqBody=${JSON.stringify(reqBody)}\n\nWITH sentToDB=${JSON.stringify(sentToDB)}\n\n`)
  let partial_update = false
  for (const field in reqBody) {
    if (field in sentToDB) {
      if (field.includes('date')) {
        date_rb_time = (new Date(reqBody[field])).getTime()
        date_DB_time = (new Date(sentToDB[field])).getTime()
        //debug(`comparing DATE fields ${field}: ${date_rb_time} ?=? ${date_DB_time}`)
        if ( date_rb_time != date_DB_time ) {
          debug(`detecting DATE field ${field} is DIFFERENT`);
          partial_update = true; break;
        }
      }
      else {
        //debug(`comparing fields ${field}: ${reqBody[field]} ?=? ${sentToDB[field]}`)
        if (sentToDB[field] != reqBody[field]) {
          debug(`detecting NON-DATE field ${field} is DIFFERENT`);
          partial_update = true; break;
        }
      }
    }
  }
  return partial_update
}


// Delete a session

module.exports.delete = async function (req, res) {
  debug("Deleting session: " + req.params.sessionId);
  const user = req.session;
  debug("User "+user.user_id+" (role "+user.role_id+") asks to delete session "+req.params.sessionId);
  const session = await ModelPlageSession.read(req.params.sessionId);

  if(!session){
    res.status(404).end(JSON.stringify({
      log: req.i18n.__("Not found")
    }));
    return
  }

  debug("(authored by "+session.author+")")
  if ((user.user_id == session.author) || (user.role_id==1)) {
    debug("User has permission to delete, but there can be consequences if some users have registered to this session") // 
    const success = await ModelPlageSession.delete(req.params.sessionId);
    if (success) {
      res.status(200).end(JSON.stringify({
        log: req.i18n.__("Session deleted")
      }));
    } else {
      res.status(500).end(JSON.stringify({
        log: req.i18n.__("Can't delete this session")
      }));
    }
  }
  else {
    debug("You don't have the permission to delete this session (ask the author or an admin to do that)")
    res.status(403).end(JSON.stringify({
      log: req.i18n.__("Can't delete this session")
    }));
  }
};

// Get all sessions for a given user

module.exports.readForUser = async function (req, res) {
  debug("Reading sessions for user : " + req.params.userId);

  const sessionsId = await ModelPlageSession.readStudentSub(req.params.userId);

  const sessions = [];

  for (const row of sessionsId) {
    const session = await ModelPlageSession.read(row.ps_id);
    sessions.push(session);
  }

  if (sessions) {
    res.status(200).send(JSON.stringify(sessions));
  } else {
    res.status(500).end();
  }
};

module.exports.readAvailable = async function (req, res) {
  debug("Send list of available sessions, ie with end_date after today");
  const tab = await ModelPlageSession.readAvailable(); //readAll();
  const userId = req.params.userId;

  if (!userId) {
    return res.status(404).end();
  }
  // Remove from tab sessions already subscribed bu this user
  const userSession = await ModelPlageSession.readStudentSub(userId);
  if (tab && userSession) {
    let subscribedSession = [];
    for (let i = 0; i < userSession.length; i++) {
      for (let j = 0; j < tab.length; j++) {
        if (tab[j].ps_id == userSession[i].ps_id) {
          subscribedSession.push(tab[j]);
          tab.splice(j, 1);
        }
      }
    }
    res.status(200).json(tab);
  } else {
    res.status(500).end();
  }
};

// Get all exercises for a given session

getExListForSession = async function (sessionId) {
  const sequenceId = await ModelPlageSession.readSessionSequence(sessionId);

  if (sequenceId.length != 0) {
    const sequences = await ModelSequence.read(sequenceId[0].seq_id);
    const exerciseList = await ModelExercise.readAll();
    const exercises = [];

    for (i = 0; i < sequences.length; i++) {
      for (j = 0; j < exerciseList.length; j++) {
        if (sequences[i].ex_id === exerciseList[j].ex_id) {
          exercises.push(exerciseList[j]);
        }
      }
    }
    return exercises;
  } else {
    return "Not found";
  }
};

module.exports.getExercisesForSession = async function (req, res) {
  debug("Reading exercises for session : " + req.params.sessionId);

  const exercises = await getExListForSession(req.params.sessionId);

  if (exercises) {
    if (exercises === "Not found") {
      res.status(404).end();
    } else {
      res.status(200).send(JSON.stringify(exercises));
    }
  } else {
    res.status(500).end();
  }
};

module.exports.getExerciseProductionForStudentSession = async function (req, res) {
  debug(
    "Reading exercise productions for session : " + req.params.sessionId + " and user : " + req.params.userId
  );

  const exercises = await getExListForSession(req.params.sessionId);

  const result = [];

  if (exercises) {
    if (exercises === "Not found") {
      res.status(404).end();
    } else {
      const exProd = await ModelExerciseProduction.readStuList(req.params.userId);
      for (i = 0; i < exercises.length; i++) {
        for (j = 0; j < exProd.length; j++) {
          if (exercises[i].ex_id === exProd[j].ex_id) {
            result.push(exProd[j]);
          }
        }
      }
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).end();
      }
    }
  }
};

// Register to a session

module.exports.registerToSession = async function (req, res) {
  const plagesession = await ModelPlageSession.read(req.body.ps_id);

  if (!plagesession) {
    res.status(404).end();
    return;
  }

  if (plagesession.secret_key) {
    if (!(plagesession.secret_key == req.body.secret_key)) {
      res.status(400).end();
      return;
    }
  }

  const success = await ModelPlageSession.addStudent(req.body.user_id, req.body.ps_id);

  if (success) {
    res.status(200).send(JSON.stringify(req.body.ps_id));
  } else {
    res.status(500).end();
  }
};

module.exports.registeredCount = async function (req ,res){
  const count = await ModelPlageSession.numberOfStudents(req.params.sessionId);

  if(count){
    res.status(200).json(count)
  }
  else{
    res.status(500).end()
  }
}

//Quit a session

module.exports.quitSession = async function (req, res) {
  const success = await ModelPlageSession.quitSession(req.session.user_id, req.body.ps_id);
  if (success) {
    res.status(200).end();
  } else {
    res.status(500).end();
  }
};
