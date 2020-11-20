function myFunction3(){
  line_push('*テスト*');
}

function getProperty(key){
  const token = PropertiesService.getScriptProperties().getProperty(key);
  return token;
}


function main() {
  var QUERY = '(label:トモノカイ OR is:important) AND -label:line AND -from:forms-receipts-noreply@google.com';
  var threads = GmailApp.search(QUERY, 0, 1); 
  
  for(var i in threads){
    
    var thread = threads[i];   
    var msgs = thread.getMessages();
    // for(var m = 0;m<=0;m++){
    var msg = msgs[-1];
    var d = msg.getDate();
    var date = makeDays0(d);
    var adress = msg.getFrom();
    var subject = msg.getSubject();
    var body = msg.getPlainBody().slice(0,1500);
    var message = ['メール届いてた！\n\n','メール！\n\n','メールだよ！\n\n','メール！メール！\n\n','これ届いてたよー\n\n','メールだよー\n\n','メールです！\n\n'];
    var number = message.length;
    var random = Math.floor(Math.random()*number);
    var sentensFirst = message[random];
    //Logger.log(thread);
    line_push(sentensFirst+"【From】"+adress+"\n【日付】: "+date+"\n【件名】: "+subject+"\n【本文】:\n"+body);
    //line_push(sentensFirst+"\n\n【日時】: "+date+"\n【件名】: "+subject+"\n【本文】:\n"+body+"\n\n「"+sentensSecond+"…」");
    //Logger.log("【日時】:\n"+date+"\n【件名】:\n"+subject+"\n【本文】:\n"+body);
    
  }
  
  // add label:line
  var label_line = GmailApp.getUserLabelByName('line');
  for (var i in threads) {
    threads[i].addLabel(label_line);    
  }
}



//ポストで送られてくるので、ポストデータ取得
//JSONをパースする
function doPost(e) {
  var CHANNEL_ACCESS_TOKEN = getProperty('CHANNEL_ACCESS_TOKEN'); 
  var line_endpoint = 'https://api.line.me/v2/bot/message/reply';
  var json = JSON.parse(e.postData.contents);

  //返信するためのトークン取得
  var reply_token= json.events[0].replyToken;
  if (typeof reply_token === 'undefined') {
    return;
  }
  
  //送られたLINEメッセージを取得
  var user_message = json.events[0].message.text;  
  var user_id = json.events[0].source.userId;
  
  //返信する内容を作成
  var reply_messages;
  switch(true){
  
  case new RegExp('ID').test(user_message):
    reply_messages = ['IDは' + user_id + 'だよー']; break;

  case new RegExp('ありがと').test(user_message):
    reply_messages = [makeRandom(['どういたしまして','ふふん','１つ貸しね！','ちょろいもんよー'])]; break;

  case new RegExp('今日').test(user_message):
    line_push(makeRandom(['きょうはー','きょうはねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']));
    pushSchedule(0); break;

  case new RegExp('きょう').test(user_message):
    line_push(makeRandom(['今日はー','今日はねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']));
    pushSchedule(0); break;

  case new RegExp('明日').test(user_message):
    line_push(makeRandom(['あすはー','あしたはー','あしたはねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']));
    pushSchedule(1); break;

  case new RegExp('あした').test(user_message):
    line_push(makeRandom(['明日はー','明日はねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']));
    pushSchedule(1); break;

  case new RegExp('あす').test(user_message):
    line_push(makeRandom(['明日はー','明日はねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']));
    pushSchedule(1); break;

  case new RegExp('明後日').test(user_message):
    line_push(makeRandom(['あさってはー','あさってはねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']));
    pushSchedule(2); break;

  case new RegExp('あさって').test(user_message):
    line_push(makeRandom(['明後日はー','明後日はねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']));
    pushSchedule(2); break;

  case new RegExp('予定').test(user_message):
    line_push(makeRandom(['いつの？','いつが知りたい？','いつの話ー？','いつ？','いつー？','いついつ？？','しょうがないなあ']));
    reply_messages = [makeRandom(['教えてあげよう','教えてあげる','教えてあげるよ'])]; break;
  
  case new RegExp('おやすみ').test(user_message):
    line_push(makeRandom(['おやすみ','おやすみ！','まだ起きてたの？おやすみ']));
    reply_messages = [makeRandom(['いい夢見てね','また明日！','zzz','','','','','','','','',''])]; break;
    
  /*
  case user_message == "予定":
    line_push(makeRandom(['いつの？','いつが知りたい？']));
    reply_messages = [makeRandom(['教えてあげよう','教えてあげる'])]; break;
  */

  default:
  reply_messages = [makeRandom(['何？','何か言ったかんな？','zzz','ん？','','','','','',''])]; break;
  }
  
 

  // メッセージを返信
  var messages = reply_messages.map(function (v) {
    return {'type': 'text', 'text': v};    
  });    
  UrlFetchApp.fetch(line_endpoint, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': reply_token,
      'messages': messages,
    }),
  });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}
