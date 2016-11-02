var firebase = require("firebase");

firebase.initializeApp({
  serviceAccount: "firebase.json",
  databaseURL: "https://blazing-fire-8853.firebaseio.com"
});

var db = firebase.database();
var listCollection = db.ref('server/data/');

var TelegramBot = require('node-telegram-bot-api');
var token = '246332843:AAGEehkw7lLxaKp1yuBBney0HTu-hf67t4E';
var bot = new TelegramBot(token, {polling: true});

//on start
bot.onText(/\/start/, function(msg, match) {
  var chatID = msg.chat.id;
  var name = msg.chat.first_name;
  console.log("chat ID is " + chatID);
  //initializing an empty list (this is a problem if /start is called amany times!!!)
  var user = listCollection.child("chatIDs");
  var obj = {};
  obj[chatID] = [];
  user.set(obj);

  if (name == undefined) {
    name = "all";
  }

  var output = "hey " + name + "! this is a list bot, of sorts. \
  to use this list bot, type /add [item], /delete [index of item], \
  /clear, /changeListName [new list name], /peek";
  bot.sendMessage(chatID, output);
});

bot.onText(/\/add/, function(msg, match) {
  var chatID = msg.chat.id;

  //getting the input item from user
  var item = match["input"];
  item = item.substring(5);
  console.log("Item to be added " + item);

  var list = db.ref("server/data/chatIDs/" + chatID);
  list.once("value", function(snapshot) {
    console.log("calling...");
    var originalList = snapshot.val();
    //in case it hasn't been initialized yet
    if (originalList == null) {
      originalList = [];
    }
    originalList.push(item);
    list.set(originalList);
    printListInChat(chatID);
  });

});


//
// bot.onText(/\/delete/, function(msg, match) {
//   chatID = msg.chat.id;
//   var entry = Number(msg.text.substring(7));
//   if (entry > -1 && entry <= list.length) {
//     //offset zero-based index
//     list.splice(entry - 1, 1);
//   }
//
//   bot.sendMessage(chatID, listToString());
// })
//
// bot.onText(/\/clear/, function(msg, match) {
//     chatID = msg.chat.id;
//     list = [];
//     bot.sendMessage(chatID, listName + " list emptied!");
// });
//
bot.onText(/\/peek/, function(msg, match) {
  chatID = msg.chat.id;
  printListInChat(chatID);
});
//
// bot.onText(/\/changeListName/, function(msg, match) {
//   listName = msg.text.substring(16);
// })
//
//
//HELPER FUNCTIONS
function printListInChat(userChatID) {
  var list = db.ref("server/data/chatIDs/" + userChatID);
  // Attach an asynchronous callback to read the data at our posts reference
  list.on("value", function(snapshot) {
    var output = "";
    var data = snapshot.val();
    if (data.length != null) {
      output += "\n list\n";
      output += "=======\n";
      for (var i = 0; i < data.length; i ++) {
        output += (i+1) + ". " + data[i] + "\n";
      };
    }


    bot.sendMessage(userChatID, output);
  });
}

function print(){
  for (var i = 0; i < list.length; i++) {
    console.log(idToList[chatID][i]);
  }
}
