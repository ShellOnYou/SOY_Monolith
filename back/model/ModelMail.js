"use strict";
const ConfMail = require( "../config/ConfMail.js" );
const debug = require( "debug" )( "ModelMail" );
const nodemailer = require( "nodemailer" );

class ModelMail {

  // Constructor
  constructor( data ) {
    this.sender = data.sender;
    this.recipient = data.recipient;
    this.subject = data.subject;
    this.message = data.message;
  }

  async send_mail() {
    const transporter = initMail(); // see method bellow
    const mailData = {
      from: this.sender,
      to: this.recipient,
      subject: this.subject,
      html: this.message
    };
    debug("(send_mail) wants to send this data: "+JSON.stringify(mailData))

    try {
      // should be done asynchronously??? 
      await transporter.sendMail( mailData )
      debug( "send_mail : SUCCESS" );
      return true;
    } catch ( err ) {
      debug("Error in sending email")
      debug( "send_mail : " + err.stack );
      return false;
    }
  }
}

module.exports = ModelMail;

function initMail() {
  let mailer;
  if ( ConfMail.mailService != undefined && ConfMail.mailService != "" ) {
    debug("mailService defined")
    mailer = nodemailer.createTransport( {
      service: ConfMail.mailService,
      auth: {
        user: ConfMail.mailUser,
        pass: ConfMail.mailPass
      }
    } );
  } else {
      debug("Using a specific mailService")
      mailer = nodemailer.createTransport( {
        host: ConfMail.mailHost,
        port: ConfMail.mailPort,
        secure: ConfMail.mailSecure,
        auth: {
          user: ConfMail.mailUser,
          pass: ConfMail.mailPass
        }
    } );
  }
  return mailer;
}
