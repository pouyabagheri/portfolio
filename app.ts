"use strict";

import Hapi = require('hapi');
import Inert = require('inert');
import NodeMailer = require('nodemailer');
import Mail = require('nodemailer/lib/mailer');
import fs = require('fs');

const server = new Hapi.Server({
    port: 3000,
    host: '0.0.0.0'
});

server.route({
    method: 'GET',
    path: '/ping',
    handler: (request, h) => {
        return h.response("pong");
    }
});

server.route({
    method: 'POST',
    path: '/contactrequest',
    options: {
        payload: {
            output: 'data'
        }
    },
    handler: async (request, h) => {
        const payload = request.payload as any;
        const email = payload["email"];
        const name = payload["name"];
        const message = payload["message"];
        console.log("contact request email is " + email);
        
        const transporter = createnodemailer();
        const emailmessage = "Name: " + name + "<br/>" + "Email: " + email + "<br/>" + "Message: " + message;
        const mailOptions = {
            from: 'admin@gursharan.xyz', // sender address
            to: 'gursharan001@gmail.com', // list of receivers
            cc: 'pouyaxyz@gmail.com',
            subject: 'Pouya\'s Design Portfolio - Contact Form', // Subject line
            text: undefined, // plain text body
            html: emailmessage // html body
        };

        await sendmail(transporter, mailOptions);

        return h.redirect("/thankyou.html");
    }
});

server.route({
    method: 'POST',
    path: '/accessrequest',
    options: {
        payload: {
            output: 'data'
        }
    },
    handler: async (request, h) => {
        const payload = request.payload as any;
        const email = payload["email"];
        console.log("access request email is " + email);
        
        const transporter = createnodemailer();
        const emailmessage = "click on this link to access";
        const mailOptions = {
            from: 'admin@gursharan.xyz', // sender address
            to: email, // list of receivers
            subject: 'Pouya\'s Design Portfolio - Protected Content', // Subject line
            text: undefined, // plain text body
            html: emailmessage // html body
        };

        await sendmail(transporter, mailOptions);

        return h.redirect("/requestaccess-response.html");
    }
});

const init = async () => {
    await server.register(Inert);
    const projectedprojects = JSON.parse(fs.readFileSync('protectedprojects.json', 'utf8'));
    server.route({
        method: 'GET',
        path: '/{param*}',
        // options: {
        //     // refer -https://github.com/hapijs/hapi/blob/master/API.md#lifecycle-methods - onpreauth etc
        // },
        handler: {
            directory: {
                path: '_site',
                index: ['index.html']
            }
        }
    });
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();

function createnodemailer() {
    return NodeMailer.createTransport({
        host: "smtp.zoho.com",
        port: 465,
        secure: true,
        auth: {
            user: "admin@gursharan.xyz",
            pass: "set a password here"
        }
    });
}

function sendmail(transporter: Mail, mailOptions: Mail.Options) {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                resolve();
                return;
            }
            console.log('Message sent: %s', info.messageId);
            resolve();
        });
    });
}
