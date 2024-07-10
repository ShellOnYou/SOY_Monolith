const debug = require("debug")("ControllerMail");
const ModelMail = require("../model/ModelMail");

module.exports.send_mail = async function (req, res) {
  debug("Wanting to send an email");
  const data = {
    sender: req.body.sender,
    recipient: req.body.recipient,
    subject: req.body.subject,
    message: req.body.message,
  };
  debug(JSON.stringify(data));

  const mail = new ModelMail(data);
  const success = await mail.send_mail();

  if (success) {
    debug("mail sent with success");
    res.status(200).end();
  } else {
    debug("sending error");
    res.status(500).end("Error while sending mail");
  }
};
