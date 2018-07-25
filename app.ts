"use strict";

import Hapi = require('hapi');
import Inert = require('inert');
import NodeMailer = require('nodemailer');

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

const pwd = "set some password here";

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
        
        const transporter = NodeMailer.createTransport({
            host: "smtp.zoho.com",
            port: 465,
            secure: true,
            auth: {
                user: "admin@gursharan.xyz",
                pass: pwd
            }
        });
        const emailmessage = "Name: " + name + "<br/>" + "Email: " + email + "<br/>" + "Message: " + message;
        const mailOptions = {
            from: 'admin@gursharan.xyz', // sender address
            to: 'gursharan001@gmail.com', // list of receivers
            cc: 'pouyaxyz@gmail.com',
            subject: 'Pouya\'s Design Portfolio - Contact Form', // Subject line
            text: undefined, // plain text body
            html: emailmessage // html body
        };

        const p = new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if(error) {
                    console.log(error);
                    resolve();
                    return;
                }
                console.log('Message sent: %s', info.messageId);
                resolve();
            });
        });
        
        await p;
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
        
        const transporter = NodeMailer.createTransport({
            host: "smtp.zoho.com",
            port: 465,
            secure: true,
            auth: {
                user: "admin@gursharan.xyz",
                pass: pwd
            }
        });
        const emailmessage = "click on this link to access";
        const mailOptions = {
            from: 'admin@gursharan.xyz', // sender address
            to: email, // list of receivers
            subject: 'Pouya\'s Design Portfolio - Protected Content', // Subject line
            text: undefined, // plain text body
            html: emailmessage // html body
        };

        const p = new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if(error) {
                    console.log(error);
                    resolve();
                    return;
                }
                console.log('Message sent: %s', info.messageId);
                resolve();
            });
        });
        
        await p;
        return h.redirect("/thankyou.html");
    }
});

const init = async () => {
    await server.register(Inert);
    server.route({
        method: 'GET',
        path: '/{param*}',
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