const sgMail = require('@sendgrid/mail')
const sendgridAPIKey = "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"

sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (email, name) =>{
    sgMail.send({
        to : email,
        from : 'devanshnanani24@gmail.com',
        subject : 'Thanks for joining us',
        text : `Welcome to the app ${name} let me know how you get along with the app`
    })
}

const sendCancellationEmail = (email, name) =>{
    sgMail.send({
        to : email,
        from : 'devanshnanani24@gmail.com',
        subject : "Sad to see you go",
        text : `We are sorry to see you go ${name}, let us know if there is anything we can do to make you stay`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}