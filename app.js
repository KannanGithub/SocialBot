
//****************************************************************************************************** */
//   A R C A D I A   S O C I A L   B O T
//   author  :  Kannan Gnanasigamani
//   version :  1.0
//   date    :  16/02/2018
//****************************************************************************************************** */

var questionsBot = require('./questions');
var bot = questionsBot.bot;
var builder = questionsBot.builder;

//Create restify server
const restify = require('restify');
const server = restify.createServer();
server.post('/api/arcadia/social', bot.connector('*').listen());
server.listen(process.env.PORT || 3978, () => {
    console.log(`${server.name} listening to ${server.url}`);
});

//Add dialog to return list of available social activities
bot.dialog('activities', [
    function (session) {
        builder.Prompts.choice(session, "What are you looking for?", "Health & Fitness|Drinks & Social|Host an event|Charity");
    },
    function (session, results) {
        var catagory = /(Health|Drinks|Host|Charity)/i.exec(results.response.entity);
        if(catagory[0] == "Health") {
            var msg = new builder.Message(session);
            msg.attachmentLayout(builder.AttachmentLayout.carousel)
            msg.attachments([
                new builder.HeroCard(session)
                    .title("What are you interested in?")
                    .subtitle("Social Groups At Arcadia")
                    .buttons([
                        builder.CardAction.imBack(session, " I want to join in the Badders club", "Badminton"),
                        builder.CardAction.imBack(session, " I want to join in the Runners club", "Running"),
                        builder.CardAction.imBack(session, " I want to join in the Cyclists club", "Cycling"),
                        builder.CardAction.imBack(session, " I want to join in the Footers club", "Football"),
                        builder.CardAction.imBack(session, " I want to join in the Golfers club", "Golf"),
                        builder.CardAction.imBack(session, " I want to join in the Bodybuilders club", "Gym")
                    ]),
                
            ]);
            session.send(msg).endDialog();
        } else {
            builder.Prompts.text(session, "'"+ catagory[0] + "' service is currently unavailable. Please try other services (list).");
        }
    }

]).triggerAction({ matches: /^(yes|Yes|list)/i });

// Add dialog to handle 'activities' button click
bot.dialog('activitiesButtonClick', [
    function (session, args, next) {
        var clubText = args.intent.matched[0];
        var club = /(Badders|Runners|Cyclists|Footers|Golfers|Bodybuilders)/i.exec(clubText);
        var clubOrganiser;
        switch (club[0]) {
            case 'Badders':
                clubOrganiser = "Vee Naga";
                break;
            case 'Runners':
                clubOrganiser = "Matt Wilson";
                break;
            case 'Cyclists':
                clubOrganiser = "Devid Belton";
                break;
            case 'Footers':
                clubOrganiser = "Matt Amis";
                break;
            case 'Golfers':
                clubOrganiser = "Jerold Butler";
                break;
            case 'Bodybuilders':
                clubOrganiser = "Jack Smith";
        }

        session.userData.organiser = clubOrganiser;
        // Send confirmation to users
        session.send('The Club Organiser for '+ club[0] + ' is '+ clubOrganiser + '. Would you like to get his contact details(contact/exit)?').endDialog();
    }
]).triggerAction({ matches: /(join|list)\s.*club/i });

// Add dialog to handle 'exit' button click
bot.dialog('exit', [
    function (session, args, next) {
        session.send("Thanks for using our service. Have Fun!");
    }
]).triggerAction({ matches: /(exit|Exit)/i });

// Add dialog to return 'contact' details.
bot.dialog('contact', [
    function(session) {
        //Using array of JSON objects
        let jsonData = require('./contacts.json');   
        var organiserDetails = jsonData.filter(contact => contact.name === session.userData.organiser);
        let adaptiveCardMessage = new builder.Message(session)
        .addAttachment({
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
                type: "AdaptiveCard",
                body: [
                        {
                            "type": "TextBlock",
                            "text": organiserDetails[0].name,
                            "size": "large",
                            "weight": "bolder"
                        },
                        {
                            "type": "TextBlock",
                            "text": organiserDetails[0].jobTitle
                        },
                        {
                            "type": "TextBlock",
                            "text": organiserDetails[0].department
                        },
                        {
                            "type": "TextBlock",
                            "text": organiserDetails[0].phone
                        }
                    ]
                    }
                });

        //session.send(adaptiveCardMessage);
        builder.Prompts.text(session, adaptiveCardMessage);

    },
    function(session, results) {
        builder.Prompts.text(session, "Is there anything else you want me to help you with(more/exit)?");
    },
    
    function(session, results) {
        let response = /(more|More)/i.exec(results.response);
        if(response) {
            session.send("We are still waiting for John Piller to contribute his code to extend this bot functionality. You will get a full bot service shortly");
            session.send("Thank you for using our service.").endDialog();
        }
    }

]).triggerAction({ matches: /(contact|Contact)/i });
