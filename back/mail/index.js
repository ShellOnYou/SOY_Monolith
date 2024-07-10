const ejs = require("ejs");
const { readFileSync } = require("fs");
const nodemailer = require("nodemailer");


var transporter = undefined
transporter = getTransporter()
transporter.verify(function (error, success) {
    if (error) {
      console.error(error)
    } else {
      console.log("[MAIL] Server is ready to take our messages");
    }
});


function endsWithAny(suffixes, string) {
    return suffixes.some(function (suffix) {
        return string.endsWith(suffix);
    });
}

function validateEmail(email) {
    let authorized_email_end_with = process.env.AUTHORIZED_EMAIL_END_WITH
    if(!authorized_email_end_with) authorized_email_end_with = ""
    if(!email || email == "") return false
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase()) && endsWithAny(authorized_email_end_with.split(','), email);
}


function getTransporter() {
    if(transporter) return transporter
    
    let mailer;
    if (process.env.EMAIL_SERVICE != undefined && process.env.EMAIL_SERVICE != "") {
        mailer = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            port: Number(process.env.EMAIL_SMTP_PORT),
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL_ACCOUNT,
                pass: process.env.EMAIL_PWD
            }
        });
    } else {
        mailer = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_SMTP_PORT),
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL_ACCOUNT,
                pass: process.env.EMAIL_PWD
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }
    return mailer;
}


function getTextFromTemplate(template){
    return ""
}

function sendMail(to, subject, template, CORDIALLY, ALL_RIGHTS_RESERVED, text = "") {
    return new Promise(async (resolve, reject) => {
        if(!validateEmail(to)) return reject("Mail invalide : " + to)
        let compiled_template = await readFileSync(__dirname + "/mail.html", {encoding: "utf-8"})
        compiled_template = ejs.render(compiled_template, {
            content: template,
            baseUrl: process.env.PLAGE_ENV,
            appName: process.env.APP_NAME,
            emailAccount: process.env.EMAIL_ACCOUNT,
            ALL_RIGHTS_RESERVED: ALL_RIGHTS_RESERVED,
            CORDIALLY: CORDIALLY,
        })

        compiled_template = compiled_template.replace(/{{ BASE_URL }}/gi, process.env.PLAGE_ENV || "")
        
        var mailOptions = {
            from: process.env.EMAIL_ACCOUNT,
            to: to,
            subject: subject,
            text: text, //getTextFromTemplate(template),
            html: compiled_template
        };
        
        getTransporter().sendMail(mailOptions, function(error, info){
            if (error) {
                console.log("[MAIl] Email error: " + error)
                reject(error)
            } else {
                console.log("[MAIL] Email sent to "+to+": " + info)
                resolve(info)
            }
        });
    })
}

module.exports.sendMail = sendMail