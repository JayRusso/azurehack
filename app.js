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
                session.beginDialog('accounts')
                break;
            default:
                session.send(prompts.exitMsg)
                session.endDialog();
                break;
        }}
]).triggerAction({matches: /^help/i})

bot.dialog('accounts',[
    (session)=>
    {
        builder.Prompts.choice(session, "Ok, I can help with your account... What would you like to do with your account?", "Creating a master account|Adding users|Modifying account information|Deleting a profile", {listStyle:3})
    },
    function(session, results){
        switch (results.response.index) {
            case 0:
                var msg = new builder.Message(session).addAttachment(createMasterAccountCard(session));
                session.send(msg);
                 session.beginDialog('accounts')
                break;
            case 1:
                var msg = new builder.Message(session).addAttachment(addUserCard(session));
                session.send(msg);
                 session.beginDialog('accounts')
                break; 
            case 2:
                var msg = new builder.Message(session).addAttachment(modifyAccountCard(session));
                session.send(msg);
                 session.beginDialog('accounts')
                break; 
            case 3:
                var msg = new builder.Message(session).addAttachment(deleteProfileCard(session));
                session.send(msg);
                 session.beginDialog('accounts')
                break;                                 
            default:
                session.send(prompts.exitMsg)
                session.endDialog();
                break;
        }}
]).triggerAction({matches: /^accounts/i})

function createMasterAccountCard(session) {
    return new builder.HeroCard(session)
        .title('Creating the master account')
        .subtitle('Creating the master account is easy...')
        .text('If you are connecting for the first time, you will automatically be asked to create a user profile. This is the master profile that will manage your other family members’ profiles if you add them. Only the user associated with the master account can change the password and manage the other profiles linked to this account.')
        .images([
            builder.CardImage.create(session, 'http://help.kolibree.com/wp-content/uploads/2016/05/4.2.1-1024x720.png')
        ]);
}

function addUserCard(session) {
    return new builder.HeroCard(session)
        .title('Adding users')
        .subtitle('Adding users is easy...')
        .text('After the master account has been created, it is possible to add user profiles, for example for each family member. To do this, in the list of profiles, add a profile, and then follow the steps to create a new profile.')
        .images([
            builder.CardImage.create(session, 'http://help.kolibree.com/wp-content/uploads/2016/05/4.4.1-1024x720.png')
        ]);
}

function modifyAccountCard(session) {
    return new builder.HeroCard(session)
        .title('Modifying account or user information')
        .subtitle('Modifying account or user information is easy...')
        .text('Each Kolibree user can change the information in their profile. To change profile information go to the “Settings” menu in the application and then choose “Profiles”. Choose the profile photo at the top of the screen by swiping left or the right until you get to the profile that you want to change.')
        .images([
            builder.CardImage.create(session, 'http://help.kolibree.com/wp-content/uploads/2016/05/4.5.1-1024x720.png')
        ]);
}

function deleteProfileCard(session) {
    return new builder.HeroCard(session)
        .title('Deleting a profile')
        .subtitle('Deleting a profile is easy...')
        .text('Go to “Settings” and then “Profiles”. Choose the profile photo at the top of the screen by swiping left or the right until until you get to the profile you want to delete. At the bottom, select “Delete profile”.')
        .images([
            builder.CardImage.create(session, 'http://help.kolibree.com/wp-content/uploads/2016/05/4.6.1-1024x720.png')
        ]);
}
