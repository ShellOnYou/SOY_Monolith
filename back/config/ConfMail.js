module.exports = {

  // SMTP of an installed mailserver if any 

  mailHost: process.env.EMAIL_HOST, 
  mailPort: process.env.EMAIL_SMTP_PORT,
  mailSecure: true, // true // ""

  mailSender: process.env.EMAIL_ACCOUNT, 
  
  mailUser: process.env.EMAIL_ACCOUNT, 
  mailPass: process.env.EMAIL_PWD,

  mailService: "",

 
};
