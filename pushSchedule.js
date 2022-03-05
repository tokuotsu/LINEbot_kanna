function pushSchedule(num){
  var sentenceFirst ="";
  if(num == 0){
    var sentenceSecond = makeRandom(['今日','きょう']);
  }else if(num == 1){
    var sentenceSecond = makeRandom(['明日','あした','あす']);
  }else if(num == 2){
    var sentenceSecond = makeRandom(['明後日','あさって']);
  }

  var myCal = CalendarApp.getCalendarById(getProperty('my_gmail'));
  var myCal2 = CalendarApp.getCalendarById(getProperty('my_gmail2'));
  var myCal3 = CalendarApp.getCalendarById(getProperty('my_gmail3'));

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

  var event1 = myCal.getEvents(startDate,endDate);
  var event2 = myCal2.getEvents(startDate,endDate);
  var event3 = myCal3.getEvents(startDate,endDate);
  var myEvents = event1.concat(event2).concat(event3);
  var noOfAllDay = 0;
  var noOfPartDay = 0;
  
  var sentence1= sentenceFirst + sentenceSecond + "は、";
  
  myEvents.forEach(myEvent => {
    if(myEvent.getStartTime().getHours() == 0 && myEvent.getEndTime().getHours() == 0){
      noOfAllDay ++;
    }else{
      noOfPartDay ++;
    }
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
    line_push(sentence);
  }else if(noOfPartDay == 0){
    line_push(sentence);
  }else{
    line_push(sentence1);
    line_push(sentence2);
  }
  //Logger.log();
}