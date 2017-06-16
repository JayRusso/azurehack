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
                session.beginDialog('ChangingBrushhead')
                break;
            case 1:
                session.beginDialog('BrushingTechniques')
                break;
            case 2:
                session.beginDialog('Brushingwithapp')
                break;
            case 3:
                session.beginDialog('BrushingwithoutApp')
                break;
            case 4: 
                session.beginDialog('Orderbrushhead')
                break;
            default:
                session.send(prompts.exitMsg)
                session.endDialog();
                break;
        }}
]).triggerAction({matches: /^help/i})

bot.dialog('ChangingBrushhead',[
    (session)=>
    {
    var image = "http://help.kolibree.com/wp-content/uploads/2016/05/3.1.1-1024x429.png";
    var message = "Kolibree brush heads are easily interchangeable so each member of the family can use the same toothbrush, by simply changing the brush head at the appropriate time. To change brush heads: 1. Unlock the brush head by turning it counterclockwise until the two indicators are lined up.2. Pull the brush head upward to remove it from the handle.3. Replace with a new brush head by lining up the indicators.4. Turn the brush clockwise until it locks.";
    var card = createHeroCard(image,message,session);

    var msg = new builder.Message(session).addAttachment(card);
    session.send(msg);
    session.beginDialog('SolvedQuestion');
}]);
bot.dialog('SolvedQuestion',[//This will be used to ask the user if the question was solved
    (session)=>
    {  
         builder.Prompts.choice(session,"Did that solve your problem","Yes|No", {listStyle:3});
    },
function(session, results){
        switch (results.response.index) {
            case 0:
                session.beginDialog('Solved')
                break;
            case 1:
                session.beginDialog('NotSolved')
                break;
            default:
                session.send(prompts.exitMsg)
                session.endDialog();
                break;
        }}
]);

bot.dialog('Solved',[
    (session)=>
    {
        builder.Prompts.choice(session, "Do you have any other questions","Yes|No", {listStyle:3});
    },
    function(session, results){
        switch (results.response.index) {
            case 0:
                session.beginDialog('help')
                break;
            case 1:
                session.send(prompts.exitMsg)
                session.endDialog();
                break;
            default:
                session.send(prompts.exitMsg)
                session.endDialog();
                break;
        }}
]);


function createHeroCard(URL,message,session) {
    return new builder.HeroCard(session)
        //.title('BotFramework Hero Card')
       // .subtitle('Your bots — wherever your users are talking')
        .text(message)
        .images([
            builder.CardImage.create(session, URL)
        ])
      //  .buttons([
        //    builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework', 'Get Started')

        //]);
}

