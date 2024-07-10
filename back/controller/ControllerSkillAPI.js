const debug = require("debug")("ConstrollerSkillAPI");
const Model = require("../model/Model");
const ModelSkill = require("../model/ModelSkill");

module.exports.readAllByLocale = async function (req, res) {
  debug("All skills matching locale");
  if (req.query.locale !== undefined) {
    const tabSkill = await ModelSkill.readWithTheme(req.query.locale);
    if (tabSkill) {
      res.status(200).json(tabSkill);
    } else {
      res.status(500).end();
    }
  } else {
    res.status(400).end();
  }
};

module.exports.read = async function (req, res) {
  debug("A skill by skill_code");
  const skill = await ModelSkill.read(req.params.skillCode);
  if (skill) {
    res.status(200).json(skill);
  } else {
    res.status(500).end();
  }
};

//Create a new skill
module.exports.create = async function (req, res) {
  debug("Create a skill");

  if (!req.body) {
    //Invalid request
    res.status(400).end();
  } else {
    const data = {
      skill_code: req.body.skill_code,
      name: req.body.name,
      th_id: req.body.th_id,
      description: req.body.description,
      ref_code: req.body.ref_code,
      locale: req.body.locale,
    };

    const skill = new ModelSkill(data);
    const skill_code = await skill.save();
    if (skill_code) {
      res.status(201).json({
        skill_code: skill_code,
      });
    } else {
      res.status(500).end();
    }
  }
};

module.exports.update = async function (req, res) {
  debug("Update a skill");

  if (!req.body) {
    //Invalid request
    res.status(400).end();
  } else {
    //Check if skillCode is right
    const skill = await ModelSkill.read(req.params.skillCode);

    if (skill) {
      const data = {
        skill_code: req.params.skillCode,
        name: req.body.name,
        th_id: req.body.th_id,
        description: req.body.description,
        ref_code: req.body.ref_code,
        locale: req.body.locale,
      };
      const skillUpdated = new ModelSkill(data);
      const success = await skillUpdated.update();
      if (success) {
        //Get the new skill
        const newSkill = await ModelSkill.read(req.params.skillCode);
        //Return the new skill
        res.status(200).json(newSkill);
      } else {
        res.status(500).end();
      }
    } else {
      res.status(404).end();
    }
  }
};

module.exports.delete = async function (req, res) {
  debug("Deleting skill: " + req.params.skillCode);
  await ModelSkill.delAllLinkSkill(req.params.skillCode);
  const success = await ModelSkill.delete(req.params.skillCode);
  if (success) {
    res.status(200).end();
  } else {
    res.status(500).end();
  }
};

module.exports.readAllByEx = async function (req, res) {
  debug("Reading all skill for one exercise");
  const skills = await ModelSkill.readAllByEx(
    req.params.exerciseId,
    req.query.locale
  );
  debug(skills);
  if (skills) {
    res.status(200).json(skills);
  } else {
    res.status(500).end();
  }
};


module.exports.createAllByEx = async function (req, res) {
  debug("Link skills to an exercise");
  let ExerciseLevels = [];
  let success = true;
  for (i = 0; i < req.body.length; i++) {
    debug("Linking skill "+req.body[i].skill_code);
    const temp = await ModelSkill.addLinkSkillEx(
      req.params.exerciseId,
      req.body[i].skill_code
      // req.body[i].nam_id
    );
    if (temp) {
      const exerciseLevel = await ModelSkill.readExerciseLevel(
        req.body[i].skill_code,
        req.params.exerciseId,
        1
      );
      ExerciseLevels.push(exerciseLevel);
    } else {
      success = false;
    }
  }
  if (success) {
    res.status(201).json(ExerciseLevels);
  } else {
    res.status(500).end();
  }
};


module.exports.deleteAllExerciseLevelByEx = async function (req, res) {
  debug("deleteAllExerciseLevelByEx(): Delete all ExerciseLevel by exercise id (for ex_id "+req.params.exerciseId+")");
  const success = await ModelSkill.delAllLinkEx(req.params.exerciseId);
  if (success) {
    res.status(200).end();
  } else {
    res.status(500).end();
  }
};

module.exports.updateAllSkillsByEx = async function (req, res) {
  debug("Update all Skills by exercise id (by locale if specified)");
  if (!req.body) {
    //Invalid request
    res.status(400).end();
  } else {
    //Check if skillCode is right
    const skills = await ModelSkill.readAllByEx(
      req.params.exerciseId,
      req.query.locale
    );

    let success = true;
    if (skills) {
      for (i = 0; i < skills.length; i++) {
        const data = {
          skill_code: skills[i].skill_code,
          name: req.body.name,
          th_id: req.body.th_id,
          description: req.body.description,
          ref_code: req.body.ref_code,
          locale: req.body.locale,
        };

        const skillUpdated = new ModelSkill(data);
        const tempSuccess = await skillUpdated.update();
        if (!tempSuccess) {
          success = false;
        }
      }
      if (success) {
        //Get the new skills
        const newSkills = await ModelSkill.readAllByEx(
          req.params.exerciseId,
          req.query.locale
        );
        //Return the new skills
        res.status(200).json(newSkills);
      } else {
        res.status(500).end();
      }
    } else {
      res.status(404).end();
    }
  }
};
