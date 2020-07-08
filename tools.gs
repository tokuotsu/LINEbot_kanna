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

function myFunction2(){
  makeRandom(['あしたはー','あしたはねー','えーっと','ちょっと待ってね','ちょいまちー','うーんと']);
}


function myFunction(){
  
  //var a = new RegExp(target);
  /*
  if(a.match(/西/)){
    Logger.log('yes');
  }
  */
  //var a = new RegExp('東');
  switch(true){
  case new RegExp('東').test('東工大'):
    Logger.log('yes'); break;
  default: break;
  }
  
  //  Logger.log(a.match(/東/));
}

function makeDays(d){
  var y = d.getFullYear();
  var m = d.getMonth()+1;
  var d2 = d.getDate();
  var h = d.getHours();
  var min = d.getMinutes();
  var s = d.getSeconds();
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
  var min = d.getMinutes();
  var s = d.getSeconds();
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

/*
function pusfTodaySchedule(){
  var myCal = CalendarApp.getCalendarById(getProperty('my_gmail'));

  var startDate = new Date();
  startDate.setHours(0);
  startDate.setMinutes(0);
  startDate.setSeconds(0);

  var endDate = new Date();
  endDate.setHours(23);
  endDate.setMinutes(59);
  endDate.setSeconds(59);
  //Logger.log(startDate);

  var myEvents = myCal.getEvents(startDate,endDate);
  var noOfAllDay = 0;
  var noOfPartDay = 0;
  
  var sentence1= "おはようございます\n今日は、";
  
  for each(var myEvent in myEvents){
    if(myEvent.getStartTime().getHours() == 0 && myEvent.getEndTime().getHours() == 0){
      noOfAllDay ++;
    }
  }
  for each(var myEvent in myEvents){
    if(myEvent.getStartTime().getHours() != 0 || myEvent.getEndTime().getHours() != 0){
      noOfPartDay ++;
    }
  }
  var allDay = noOfAllDay + noOfPartDay;

  if(noOfAllDay == 0){
    //var title = myEvents[i].getTitle();
    sentence1 = "";
  }else if(noOfAllDay == 1){
    var title = myEvents[0].getTitle();
    sentence1 += title + "の予定だよ\n";    
  }else{
    for(var i = 0; i <= noOfAllDay - 2; i++){
      var title = myEvents[i].getTitle();
      sentence1 += title + "、";
      }
    var lastTitle = myEvents[noOfAllDay-1].getTitle();
    sentence1 += lastTitle + "の予定！\n";
  }
  
  if(noOfAllDay == 0){
    var sentence2 = "おはようございます\n今日は、";
  }else{
    var sentence2 = "そのほか、";
  }

  if(noOfPartDay == 0){
    //var title = myEvents[i].getTitle();
    sentence2 = "";
  }else if(noOfPartDay == 1){
    var title = myEvents[noOfAllDay].getTitle();
    var startTime = makeDays(myEvents[noOfAllDay].getStartTime());
    var endTime = makeDays(myEvents[noOfAllDay].getEndTime());
    var location = myEvents[noOfAllDay].getLocation();
    if (location !== ""){
        sentence2 += cutString(myEvents[noOfAllDay].getLocation()) + "で" + startTime + "から" + endTime + "まで" + title + "があります";
        }else{
        sentence2 += startTime + "から" + endTime + "まで" + title + "があります";
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
        sentence2 += cutString(myEvents[allDay-1].getLocation()) + "で" + startTime + "から" + endTime + "まで" + lastTitle + "があります";
        }else{
        sentence2 += startTime + "から" + endTime + "まで" + lastTitle + "があります";
        }
  }
  var sentence　= sentence1 + sentence2;
  if(allDay == 0){
    sentence = "おはようございます\n今日の予定は特にありません"
  }
  line_push(sentence);
  //Logger.log();

}
*/

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
  
  for each(var myEvent in myEvents){
    if(myEvent.getStartTime().getHours() == 0 && myEvent.getEndTime().getHours() == 0){
      noOfAllDay ++;
    }
  }
  for each(var myEvent in myEvents){
    if(myEvent.getStartTime().getHours() != 0 || myEvent.getEndTime().getHours() != 0){
      noOfPartDay ++;
    }
  }
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
