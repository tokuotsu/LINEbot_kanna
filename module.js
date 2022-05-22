function cutString(str){
  var index = str.indexOf(',');
  str = str.slice(0,index)
  return str;
}

//  リストの中の単語をランダムに返す
function makeRandom($wordsList){
  var number = $wordsList.length;
  var random = Math.floor(Math.random()*number);
  return $wordsList[random];
}

function getProperty(key){
  const token = PropertiesService.getScriptProperties().getProperty(key);
  return token;
}

// エラーログをスプレッドシートに書き込む
function log2spread(error){
  Logger.log("error occured");
  Logger.log(error);
  var ss = SpreadsheetApp.openById(getProperty("my_ss_id"));
  var ss = ss.getSheetByName('エラーログ');
  var last_row = ss.getLastRow();
  var area = ss.getRange(last_row+1,1,1,2);
  var now = new Date();
  var date = makeDays_(now, type=0);
  var log = [[`${date}`, `${error.stack}`]]
  area.setValues(log);
}

// 日付を整形して返す
function makeDays_(date, type=1){
  if (date == ""){
    return "";
  }else if(type==0){
    return Utilities.formatDate(date, "JST", "YYYY'/'M'/'d HH':'mm':'ss");
  }else if(type==1){
    return Utilities.formatDate(date, "JST", "M'/'d");
  }else if(type==2){
    return Utilities.formatDate(date, "JST", "M'/'d HH':'mm':'ss");
  }else if(type==3){
    return Utilities.formatDate(date, "JST", "HH':'mm");
  }else{
    ;
  }
}

function sleep(waitMsec) {
  var startMsec = new Date();
 
  // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
  while (new Date() - startMsec < waitMsec);
}

function makeDays(d){
  var h = d.getHours();
  var min = d.getMinutes();
  //　14時
  if(min == 0){
    var date = h+"時";
    return(date)
  }else{
    //　14時38分
    var date = h+"時"+min+"分";
    return(date)
  }
}

function makeDays0(d){
  var y = d.getFullYear();
  var m = d.getMonth()+1;
  var d2 = d.getDate();
  var h = d.getHours();
  var min = ('0'+d.getMinutes()).slice(-2);
  var s = ('0'+d.getSeconds()).slice(-2);
  //　2019/8/7 14:38:29
  var date = y+"/"+m+"/"+d2+" "+h+":"+min+":"+s;
  return(date)
}

// LINEにプッシュ通知する
function line_push(message) {
  var CHANNEL_ACCESS_TOKEN = getProperty('CHANNEL_ACCESS_TOKEN');
  var postData = {"to": getProperty('my_line_id'),"messages" : [{"type" : "text","text" : message}]};
  var options = {"method" : "post","headers" : {"Content-Type" : "application/json","Authorization" : "Bearer " + CHANNEL_ACCESS_TOKEN},"payload" : JSON.stringify(postData)};
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", options);
}

function pusfTodaySchedule(){
  pushSchedule(0)
}

function getPushNum(date) {
  var CHANNEL_ACCESS_TOKEN = getProperty('CHANNEL_ACCESS_TOKEN');
  var url = "https://api.line.me/v2/bot/message/delivery/push?date=" + date;
  var options = {
    "method": "get",
    "headers" : {Authorization : "Bearer " + CHANNEL_ACCESS_TOKEN}
  };
  let response = UrlFetchApp.fetch(url, options).getContentText();
  return JSON.parse(response);
}

function getMonthUsage(month=0) {
  var today = new Date();
  today.setMonth(today.getMonth() - month)
  var y4m2 = Utilities.formatDate(today, "JST", "YYYYMM")
  var date = today.getDate();
  var usage = 0;
  var last_date = 0;
  for (var i = 1; i < date+1; i++) {
    var search_date = `${y4m2}${("0"+i).slice(-2)}`;
    res = getPushNum(search_date);
    if (res.status == "ready"){
      usage += res.success;
      last_date = i;
    };
  }
  Logger.log(usage);
  return [usage, last_date];
}

function pushTomorrowSchedule(){
  if(5 <= new Date().getHours() && new Date().getHours() <= 9){
    line_push(makeRandom(['おはよう！','おはようございます','おはー','おはよ','おはようございます！','おっすー','やっほー']));
  }else if(10 <= new Date().getHours() && new Date().getHours() <= 17){
    line_push(makeRandom(['こんにちは','こんにちは！','おっすー','やっほー']));
  }else{
    line_push(makeRandom(['こんばんは！','今日もお疲れさま！','こんばんは','やっほー','今日もお疲れ！']));
  }
  
  var num = 1;
  var sentenceFirst ="";
  if(num == 0){
    var sentenceSecond = makeRandom(['今日','きょう']);
  }else if(num == 1){
    var sentenceSecond = makeRandom(['明日','あした','あす']);
  }else if(num == 2){
    var sentenceSecond = makeRandom(['明後日','あさって']);
  }

  var myCal = CalendarApp.getCalendarById('t.tokuhiro0317@gmail.com');

  var startDate = new Date();
  startDate.setDate(startDate.getDate() + num);
  startDate.setHours(0);
  startDate.setMinutes(0);
  startDate.setSeconds(0);

  var endDate = new Date();
  endDate.setDate(endDate.getDate() + num);
  endDate.setHours(23);
  endDate.setMinutes(59);
  endDate.setSeconds(59);
  //Logger.log(startDate);

  var myEvents = myCal.getEvents(startDate,endDate);
  var noOfAllDay = 0;
  var noOfPartDay = 0;
  
  var sentence1= sentenceFirst + sentenceSecond + "は、";
  
  myEvents.forEach(myEvent => {
    if (myEvent.getStartTime().getHours() == 0 && myEvent.getEndTime().getHours() == 0){
      noOfAllDay++;
    }else{
      noOfPartDay++;
    };
  });
  var allDay = noOfAllDay + noOfPartDay;

  if(noOfAllDay == 0){
    //var title = myEvents[i].getTitle();
    sentence1 = "";
  }else if(noOfAllDay == 1){
    var title = myEvents[0].getTitle();
    sentence1 += title + makeRandom(['の予定だよ！','の予定！','の予定だよー！']);    
  }else{
    for(var i = 0; i <= noOfAllDay - 2; i++){
      var title = myEvents[i].getTitle();
      sentence1 += title + "、";
      }
    var lastTitle = myEvents[noOfAllDay-1].getTitle();
    sentence1 += lastTitle + makeRandom(['の予定だよ！','の予定！','の予定だよー！']);
  }
  
  if(noOfAllDay == 0){
    var sentence2 = sentenceFirst + sentenceSecond +"は、";
  }else{
    var sentence2 = makeRandom(['そのほか、','ほかには、','ほかにも、','あとはねー、','あと、','ほかにはねー、','それと、','あとねー、']);
  }

  if(noOfPartDay == 0){
    //var title = myEvents[i].getTitle();
    sentence2 = "";
  }else if(noOfPartDay == 1){
    var title = myEvents[noOfAllDay].getTitle();
    var startTime = makeDays(myEvents[noOfAllDay].getStartTime());
    var endTime = makeDays(myEvents[noOfAllDay].getEndTime());
    var location = myEvents[noOfAllDay].getLocation();
    //Logger.log(location);
    if (location !== ""){
        sentence2 += cutString(myEvents[noOfAllDay].getLocation()) + "で" + startTime + "から" + endTime + "まで" + title + makeRandom(['があるよ！','がある！','があるー！','があるかな！']);
        }else{
        sentence2 += startTime + "から" + endTime + "まで" + title + makeRandom(['があるよ！','がある！','があるー！','があるかな！']);
        }    
  }else{
    for(var i = noOfAllDay; i <= allDay-2; i++){
      var title = myEvents[i].getTitle();
      var startTime = makeDays(myEvents[i].getStartTime());
      var endTime = makeDays(myEvents[i].getEndTime());
      var location = myEvents[i].getLocation();
      if (location !== ""){
        sentence2 += cutString(myEvents[i].getLocation()) + "で" + startTime + "から" + endTime + "まで" + title + "、";
        }else{
        sentence2 += startTime + "から" + endTime + "まで" + title + "、";
      }
    }
    var lastTitle = myEvents[allDay-1].getTitle();
    var startTime = makeDays(myEvents[allDay-1].getStartTime());
    var endTime = makeDays(myEvents[allDay-1].getEndTime());
    var location = myEvents[allDay-1].getLocation();
    if (location !== ""){
        sentence2 += cutString(myEvents[allDay-1].getLocation()) + "で" + startTime + "から" + endTime + "まで" + lastTitle + makeRandom(['があるよ！','がある！','があるー！','があるかな！']);
        }else{
        sentence2 += startTime + "から" + endTime + "まで" + lastTitle + makeRandom(['があるよ！','がある！','があるー！','があるかな！']);
        }
  }
  var sentence　= sentence1 + sentence2;
  if(allDay == 0){
    sentence = sentenceFirst + sentenceSecond +"の予定は特にないからゆっくり過ごしてね"
    line_push(sentence);
  }else if(noOfAllDay == 0){
    line_push(sentence2);
  }else if(noOfPartDay == 0){
    line_push(sentence2);
  }else{
    line_push(sentence1);
    line_push(sentence2);
  }
  //Logger.log();
}