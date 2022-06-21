function main() {
  var QUERY = '(label:トモノカイ OR is:important) AND -label:line AND -label:NoLINE AND -from:forms-receipts-noreply@google.com';
  var threads = GmailApp.search(QUERY, 0, 1); 
  
  for(var i in threads){    
    var thread = threads[i];   
    var msgs = thread.getMessages();
    var msg = msgs[msgs.length - 1];
    var d = msg.getDate();
    var date = makeDays0(d);
    var adress = msg.getFrom();
    var subject = msg.getSubject();
    var body = msg.getPlainBody().slice(0,1500);
    var sentensFirst = makeRandom(['メール届いてた！\n\n','メール！\n\n','メールだよ！\n\n','メール！メール！\n\n','これ届いてたよー\n\n','メールだよー\n\n','メールです！\n\n']);
    line_push(sentensFirst+"【From】"+adress+"\n【日付】: "+date+"\n【件名】: "+subject+"\n【本文】:\n"+body);    
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
  try{
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
      pushSchedule(0); return; break;

    case new RegExp('きょう').test(user_message):
      line_push(makeRandom(['今日はー','今日はねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']));
      pushSchedule(0); return; break;

    case new RegExp('明日').test(user_message):
      line_push(makeRandom(['あすはー','あしたはー','あしたはねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']));
      pushSchedule(1); return; break;

    case new RegExp('あした').test(user_message):
      line_push(makeRandom(['明日はー','明日はねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']));
      pushSchedule(1); return; break;

    case new RegExp('あす').test(user_message):
      line_push(makeRandom(['明日はー','明日はねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']));
      pushSchedule(1); return; break;

    case new RegExp('明後日').test(user_message):
      line_push(makeRandom(['あさってはー','あさってはねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']));
      pushSchedule(2); return; break;

    case new RegExp('あさって').test(user_message):
      line_push(makeRandom(['明後日はー','明後日はねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']));
      pushSchedule(2); return; break;

    case new RegExp('予定').test(user_message):
      line_push(makeRandom(['いつの？','いつが知りたい？','いつの話ー？','いつ？','いつー？','いついつ？？','しょうがないなあ']));
      reply_messages = [makeRandom(['教えてあげよう','教えてあげる','教えてあげるよ'])]; break;
    
    case new RegExp('おやすみ').test(user_message):
      line_push(makeRandom(['おやすみ','おやすみ！','まだ起きてたの？おやすみ']));
      reply_messages = [makeRandom(['いい夢見てね','また明日！','zzz','','','','','','','','',''])]; break;
    
   case new RegExp('賃金リスト').test(user_message):
     var month_length = /[0-9]{1,2}/.exec(user_message);
     if (!month_length){
       month_length = 12;
     }
     var date = new Date();
     var list = ""
     var year = date.getFullYear();
     for (var i=0;i<month_length;i++){
       month = date.getMonth() + 1;
       month -= i;
       if (month < 1){
         month = month%12 + 12;
       };
       if (month==12){
         year -= 1;
       }
       Logger.log(month)
       var [_, sum_list] = money(i);
       list += `${year}/${month}：${sum_list["salary"]+sum_list["traffic"]}円（${sum_list["time"]}）\n`;
     };
     Logger.log(list);
     reply_messages = [list];break;
//        
    case new RegExp('給料').test(user_message):
    case new RegExp('賃金').test(user_message):
      // line_push("testtest")
      var month = /[0-9]{1,2}/.exec(user_message);
      if (!month){
        lineMoney();
      }else{
        month = parseInt(month);
        if (month>=1 & month<=12){
          lineMoney(new Date().getMonth() + 1 - month);
        }
      };
      return;break;
    /*
    case user_message == "予定":
      line_push(makeRandom(['いつの？','いつが知りたい？']));
      reply_messages = [makeRandom(['教えてあげよう','教えてあげる'])]; break;
    */

    case new RegExp('push').test(user_message):
    var [usage, last_date] = getMonthUsage();
    reply_messages = [`今月は${last_date}日までに${usage}回push通知しました！`, `残り約${1000-usage}回です！`];
    break;

    default:
    reply_messages = [makeRandom(['何？','何か言ったかんな？','zzz','ん？'])]; break;
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
  }catch(e){
    log2spread(e);
  };
}
