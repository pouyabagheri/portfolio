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
        request.method
        const payload = request.payload as any;
        const email = payload["email"];
        console.log("access request email is " + email);
        
        const transporter = createnodemailer();
        const emailmessage = `click on this link to access - http://localhost:3000/checkaccessrequest?test`;
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

const portfolioAccessCookieName = 'portfolio-access';
server.state(portfolioAccessCookieName, {
    ttl: null,
    isSecure: false,
    isHttpOnly: true,
    encoding: 'base64json',
    clearInvalid: false, // remove invalid cookies
    strictHeader: true // don't allow violations of RFC 6265
});

server.route({
    method: 'GET',
    path: '/checkaccessrequest',
    handler: async (request, h) => {
        const query = request.url.query;
        console.log(query);
        h.state(portfolioAccessCookieName, {portfoliouser: 'test@test.com'});
        return h.redirect("/");
    }
});

const init = async () => {
    await server.register(Inert);
    let projectedprojects = JSON.parse(fs.readFileSync('protectedprojects.json', 'utf8')) as string[];
    projectedprojects = projectedprojects.map(p => p.toUpperCase());
    console.log(projectedprojects);
    
    server.route({
        method: 'GET',
        path: '/{param*}',
        options: {
            state: {
                parse: true
            },
            pre: [
                {
                    method: (request, h) => {
                        const urlparts = request.path.split("/").map(u => u.toUpperCase());
                        if(urlparts.length >= 2) {
                            const isProtected = projectedprojects.find((protectedproject) => protectedproject === urlparts[2]);
                            if(isProtected) {
                                console.log(`this path is protected: ${request.path}`);
                                const portfolioaccess = request.state[portfolioAccessCookieName];
                                console.log(`cookie is ${portfolioaccess}`);
                                if(portfolioaccess && portfolioaccess.portfoliouser) {
                                    return h;
                                }
                                if(request.path.toUpperCase().endsWith(".HTML")) {
                                    return h.redirect("/requestaccess.html").takeover();
                                }
                                return h.redirect("/401.jpg").takeover();
                            }
                        }
                        return h;
                    },
                    assign: "cookiecheck"
                }
            ],
            handler: {
                directory: {
                    path: '_site',
                    index: ['index.html']
                }
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
