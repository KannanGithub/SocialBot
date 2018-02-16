 var builder = require('botbuilder');
 const connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

const bot = new builder.UniversalBot(connector, [
     function (session) {
         builder.Prompts.text(session, "Hello, I am Arcadia's Social-Bot Service! ... What's your username?");
      },
     function (session, results) {
         let ad = require('./ad.json');   
         let name = ad.filter(userDetail => userDetail.userName === results.response);
         if(name[0]) {
            let firstName = name[0].name.split(" ")[0];
            builder.Prompts.text(session, "Hi " + firstName + ", Are you interested in joining a social club at Arcadia(Yes/No)?"); 
         } else {
            builder.Prompts.text(session, "Sorry! Your username is not valid."); 
         }
         
     },
     function (session, results) {
         let no = /(No|no)/i.exec(results.response);
         if(no) {
             builder.Prompts.text(session, "Okay, It seems like you have no interest in our social group. Please let us know if you have any feedback.");
         }
     },
     function (session, results) {
         builder.Prompts.text(session, "Thank you");
     }
    ]);

module.exports = {
    bot : bot,
    builder: builder,
    connector: connector
};
