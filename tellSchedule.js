function tellSchedule() {
  var myCal = CalendarApp.getCalendarById(getProperty('my_gmail'));
  var myCal2 = CalendarApp.getCalendarById(getProperty('my_gmail2'));
  var myCal3 = CalendarApp.getCalendarById(getProperty('my_gmail3'));
  // var today = new Date()
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate()+1);

  line_push(makeRandom(['こんばんは！','今日もお疲れさま！','こんばんは','やっほー','今日もお疲れ！']));
  sleep(1000)
  line_push("明日、"+""+(tomorrow.getMonth()+1)+"/"+tomorrow.getDate()+"("+['日', '月', '火', '水', '木', '金', '土'][tomorrow.getDay()]+")の予定をお知らせするよ！")
  sleep(2000)
  var event1 = myCal.getEventsForDay(tomorrow);
  var event2 = myCal2.getEventsForDay(tomorrow);
  var event3 = myCal3.getEventsForDay(tomorrow);
  var events = event1.concat(event2).concat(event3);
  ans = "終日の予定は"
  allDays = [];
  oneDays = [];
  
  // 終日、その他で分ける
  for each (var event in events){
    if (event.isAllDayEvent()){
      allDays.push(event);
    }else{
      oneDays.push(event);
    }
  }

  if (allDays.length == 0){
    ans += "ありません";
  }else{
    for each (var allDay in allDays){
      var sm = allDay.getStartTime().getMonth() + 1;
      var sd = allDay.getStartTime().getDate();
      var em = allDay.getEndTime().getMonth() + 1;
      var ed = allDay.getEndTime().getDate() - 1; // 終了日が次の日になるため

      if (sm == em){
        if (sd == ed){
          ans += "\n・" + allDay.getTitle();
        }else{
          ans += "\n・" + allDay.getTitle() + " (" + sm + "/" + sd + "~" + ed + ")";
        }
      }else{
        ans += "\n・" + allDay.getTitle() + " (" + sm + "/" + sd + "~" + em + "/" + ed + ")";
      }
    }
  }
  ans += "\n\nその他の予定は"
  if (oneDays.length == 0){
    ans+="ありません！"
  }else{
    for each (var oneDay in oneDays){
      var sh = ("0" + oneDay.getStartTime().getHours()).slice(-2);
      var sm = ("0" + oneDay.getStartTime().getMinutes()).slice(-2);
      var eh = ("0" + oneDay.getEndTime().getHours()).slice(-2);
      var em = ("0" + oneDay.getEndTime().getMinutes()).slice(-2); 

      ans += "\n・" + sh + ":" + sm + "~" + eh + ":" + em + "　" + oneDay.getTitle();
    }
  }
  ans += "\n\nになってます！";
  line_push(ans)
  // Logger.log(ans);
}
