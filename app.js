var restify = require('restify');
var builder = require('botbuilder');
const async = require('async');
var fs = require('fs');
var prompts = require('./prompts');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat bot
var connector = new builder.ChatConnector({
//   appId: process.env.MICROSOFT_APP_ID,
//   appPassword: process.env.MICROSOFT_APP_PASSWORD
  appId: null,
  appPassword: null
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var recognizer = new builder.LuisRecognizer('');
bot.recognizer(recognizer);


//=========================================================
// Bots Dialogs
//=========================================================
bot.on('conversationUpdate', (message) => {
    if (message.membersAdded) {
        message.membersAdded.forEach((identity) => {
            if (identity.id === message.address.bot.id) {
                var hello = new builder.Message()
                    .address(message.address)
                    .text(prompts.greetMsg);
                bot.send(hello);
                bot.beginDialog(message.address, '*:/');
            
    }
})}});

bot.dialog('/', [
    (session)=>
    {
        session.send(prompts.helpMsg),
        session.beginDialog('help');
}]).triggerAction({matches: /(^hello)|(^hi)/i});

bot.dialog('help',[
    (session)=>
    {
        builder.Prompts.choice(session, "what do you want to search?", "Brushing|Accounts", {listStyle:3})
    },
    function(session, results){
        switch (results.response.index) {
            case 0:
                session.beginDialog('brushing')
                break;
            case 1:
                session.beginDialog('Accounts')
                break;
            default:
                session.send(prompts.exitMsg)
                session.endDialog();
                break;
        }}
]).triggerAction({matches: /^help/i})

bot.dialog('brushing',[
    (session)=>
    {
        builder.Prompts.choice(session, "I see your having an issue with brushing. Can you be more specific, select one one of the following", "Changing brushhead|Brushing techniques|Brushing with app|Brushing without App|Order brushhead", {listStyle:3})
    },
    function(session, results){
        switch (results.response.index) {
            case 0:
                session.beginDialog('Changing Brushhead')
                break;
            case 1:
                session.beginDialog('Brushing Techniques')
                break;
            case 2:
                session.beginDialog('Brushing with app')
                break;
            case 3:
                session.beginDialog('Brushing without App')
                break;
            case 4: 
                session.beginDialog('Order brushhead')
                break;
            default:
                session.send(prompts.exitMsg)
                session.endDialog();
                break;
        }}
]).triggerAction({matches: /^help/i})
