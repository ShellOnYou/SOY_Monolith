const debug = require("debug")("ControllerProfile");
const ModelProfile = require("../model/ModelProfile");
const ModelPlageSession = require("../model/ModelPlageSession");

//Create a new profile
module.exports.create = async function (req, res) {
  debug("Create a profile - API");

  if (!req.body) {
    //Invalid request
    res.status(400).end();
  }

  const data = {
    p_id: undefined,
    job: req.body.job,
    level: req.body.level,
    sector: req.body.sector,
    locale: req.i18n.getLocale(),
    ref_id: req.body.ref_id,
    description: req.body.description,
  };

  const profile = new ModelProfile(data);
  const profileId = await profile.save();

  if (profileId) {
    res.status(201).json({
      p_id: profileId,
    });
  } else {
    res.status(500).end();
  }
};

module.exports.update = async function (req, res) {
  debug("Updating");

  if (!req.body) {
    //Invalid request
    res.status(400).end();
  } else {
    //Check if profileId is right
    const profile = await ModelProfile.read(parseInt(req.params.profileId));

    if (profile) {
      const data = {
        p_id: parseInt(req.params.profileId),
        job: req.body.job,
        level: req.body.level,
        sector: req.body.sector,
        description: req.body.description,
        ref_id: req.body.ref_id,
        locale: req.body.locale,
      };
      const profile = new ModelProfile(data);
      const success = await profile.update();
      if (success) {
        //Get the new profile
        const newProfile = await ModelProfile.read(parseInt(req.params.profileId));
        //Return the new profile
        res.status(200).json(newProfile);
      } else {
        res.status(500).end();
      }
    } else {
      res.status(404).end();
    }
  }
};

module.exports.delete = async function (req, res) {
  debug("Deleting Profile: " + req.params.profileId);
  const success = await ModelProfile.delete(req.params.profileId);
  if (success) {
    res.status(200).end();
  } else {
    res.status(500).end();
  }
};

module.exports.readAll = async function (req, res) {
  debug("ReadAPI all profile");
  const tabProfile = await ModelProfile.readAll();

  if (tabProfile) {
    res.status(200).json(tabProfile);
  } else {
    res.status(500).end();
  }
};

module.exports.read = async function (req, res) {
  debug("ReadAPI get a profile");
  const profile = await ModelProfile.read(req.params.profileId);

  if (profile) {
    debug("Profile recup de BD: " + profile);
    debug("Profile recup de BD: " + JSON.stringify(profile));
    res.status(200).json(profile);
  } else {
    res.status(500).end();
  }
};
