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

  if (name == undefined) {
    name = "all";
  }

  var output = "hey " + name + "! this is a list bot, of sorts. \
  to use this list bot, type /add [item], /delete [index of item], \
  /clear, /peek. \n\n please do not store important information in \
  the lists -- data is not encrypted.";
  bot.sendMessage(chatID, output);
});

bot.onText(/\/add/, function(msg, match) {
  var chatID = msg.chat.id;

  //getting the input item from user
  var item = match["input"];
  item = item.substring(5);

  var list = db.ref("server/data/chatIDs/" + chatID + "/list");
  list.once("value", function(snapshot) {
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
bot.onText(/\/delete/, function(msg, match) {
  chatID = msg.chat.id;
  var entry = Number(msg.text.substring(7));
  console.log(entry);


  if (isNaN(entry)) {
    bot.sendMessage(chatID, "Please enter a valid index!");
  } else {
      var list = db.ref("server/data/chatIDs/" + chatID + "/list");
      list.once("value", function(snapshot) {

        var originalList = snapshot.val();
        //in case it hasn't been initialized yet
        if (originalList == null) {
          bot.sendMessage(chatID, "List empty now; nothing to delete!");
        } else {
          var length = originalList.length;
          if (entry > -1 && entry <= length) {
            //offset zero-based index
            originalList.splice(entry - 1, 1);
            console.log(originalList);
            list.set(originalList);
            printListInChat(chatID);
          } else {
            bot.sendMessage(chatID, "Please enter a valid index!");
          }
        }
      });
  }
})

bot.onText(/\/clear/, function(msg, match) {
    var chatID = msg.chat.id;
    var list = db.ref("server/data/chatIDs/" + chatID + "/list");
    list.set([]);
    bot.sendMessage(chatID, "List emptied!");
});


bot.onText(/\/peek/, function(msg, match) {
  var chatID = msg.chat.id;
  printListInChat(chatID);
});

// bot.onText(/\/changeListName/, function(msg, match) {
//   var chatID = msg.chat.id;
//   var input = msg.text.substring(16);
//   setListName(input, chatID);
//   bot.sendMessage(chatID, "List name changed to " + input);
// })


//HELPER FUNCTIONS
function printListInChat(userChatID) {
  var list = db.ref("server/data/chatIDs/" + userChatID + "/list");
  // Attach an asynchronous callback to read the data at our posts reference
  list.once("value", function(snapshot) {
    var output = "";
    var data = snapshot.val();
    if (data != null) {
      output += "\n" + "* ~ List ~ *" + "\n";
      output += "========\n";
      for (var i = 0; i < data.length; i ++) {
        output += (i+1) + ". " + data[i] + "\n";
      };
      bot.sendMessage(userChatID, output);
    } else {
      bot.sendMessage(userChatID, "List is empty!");
    }
  });
}

//these 2 functions dont work right now
function setListName(name, userChatID) {
  var listName = db.ref("server/data/chatIDs/" + userChatID + "/listName");
  listName.once("value", function(data) {
      listName.set(name);
  });
}

function getListName(userChatID){
  var listName = db.ref("server/data/chatIDs/" + userChatID + "/listName");
  var string = "";
  listName.once("value").then(function(data) {
    string = data.val();
    return string;;
  });
};
