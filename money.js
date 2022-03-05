function getMyWorks(){
  var ss = SpreadsheetApp.openById(getProperty("my_ss_id"));
  var sheet_property = ss.getSheetByName("property");
  var table = sheet_property.getRange(2,1,10,7).getValues();
  var my_works = {};
  // Logger.log(table)
  table.forEach(row => {
    var [_, bool, name, _, wage, traffic, salary_date] = row;
    if (bool){
      my_works[name] = [wage, traffic, salary_date, 0, 0, 0];
    };
  });
  // Logger.log(my_works);
  return my_works;
}

function makeTab() {
  try{
    var ss = SpreadsheetApp.openById(getProperty('my_ss_id'));
    var tab_name = Utilities.formatDate(new Date(), "JST", "YYYYMM");
    ss.insertSheet(tab_name);
    var sheetTarget = ss.getSheetByName(tabName);
    var today = new date();
    sheetTarget.getRange(1,1,1,1).setValue(today.getMonth()+1);
    sheetTarget.getRange(1,2,1,7).setValues([['名前','開始','終了','合計','時給単価','交通費','計']]);
    // Logger.log(year + month + day);
  }catch(e){
    log2spread(e);
  };
}

function makeDay(date){
  return Utilities.formatDate(date, "JST", "HH':'mm")
}

function process(month=0){
  var today = new Date();
  var calendar = CalendarApp.getCalendarById(getProperty("my_gmail"));
  var startTime = new Date(today.getFullYear(), today.getMonth() - month, 1, 8, 0, 0);
  var endTime = new Date(today.getFullYear(), today.getMonth() - month + 1, 0, 23, 59,59);
  my_works = getMyWorks();
  work_calendars = [];
  dict = {};
  for (var i = 1; i <= endTime.getDate(); i++){
    dict[i]=[];
  };
  // Logger.log(my_works);
  // dict[1.0].push("test")
  for (var name in my_works){
    work_calendars = calendar.getEvents(startTime, endTime, {search: name});
    work_calendars.forEach(work_calendar => {
      dict[work_calendar.getStartTime().getDate()].push(work_calendar);
    });
  };
  last_result = [];
  for (var day in dict){
    if (dict[day].length == 0){
      last_result.push([day, "", "", "", "", "", "", ""]);
      continue;
    };
    dict[day].forEach(event => {
      var name = event.getTitle();
      var [wage, traffic, salary_date, _, _, _] = my_works[name];
      var st = event.getStartTime();
      var en = event.getEndTime();
      var hour = (en - st)/60/60/1000;
      var hour_int = parseInt(hour);
      var min = parseInt((hour - hour_int) * 60);
      var min_org = ("0" + min).slice(-2);
      var sum = parseInt(wage*hour) + traffic;
      my_works[name][3] += sum;
      my_works[name][4] += traffic;
      my_works[name][5] += hour;
      last_result.push([day, name, makeDay(st), makeDay(en), `${hour_int}:${min_org}`, wage.toLocaleString(), traffic.toLocaleString(), sum.toLocaleString()]);
    });
  };
  // Logger.log(last_result);
  // Logger.log(my_works);
  return {0:last_result, 1:my_works}
}

function test(){
  var date = new Date();
  var month = 0;
  date.setMonth(date.getMonth()-month);
  line_push(`${date}`);
  Logger.log(date);

}

function moneyTrigger(){
  try{
    var month = 0;
    money(month);
  }catch(e){
    log2spread(e);
  };
}

function lineMoneyTrigger(){
  try{
    var month = 0;
    lineMoney(month);
  }catch(e){
    log2spread(e);
  };
}

function money(month=1){
  try{
    var ss = SpreadsheetApp.openById(getProperty("my_ss_id"));
    var date = new Date();
    date.setMonth(date.getMonth()-month);
    var tab_name = Utilities.formatDate(date, "JST", "YYYYMM");
    var sheet_tab = ss.getSheetByName(tab_name);
    var a = process(month);
    var last_result = a[0];
    var my_works = a[1];
    sheet_tab.getRange(1,1,1,1).setValue("a");
    sheet_tab.getRange(1,1,sheet_tab.getLastRow(),sheet_tab.getLastColumn()).clearContent();
    sheet_tab.getRange(1,1,1,1).setValue(date.getMonth()+1);
    sheet_tab.getRange(1,2,1,7).setValues([['名前','開始','終了','合計','時給単価','交通費','計']]);
    sheet_tab.getRange(2, 1, last_result.length, 8).setValues(last_result);
    // Logger.log(last_result);
    // Logger.log(my_works);
    var header = [["名前", "合計時間", "給料","交通費","合計"]];
    var sum_list = {"time":0, "money":0}
    for (var name in my_works){
      var [_, _, _, sum_total, sum_traffic, sum_time] = my_works[name];
      sum_list["time"] += sum_time;
      sum_list["money"] += sum_total;
      sum_time = `${parseInt(sum_time)}:${parseInt((sum_time-parseInt(sum_time))*60)}:00`;
      Logger.log(sum_time)
      header.push([name, sum_time, (sum_total-sum_traffic).toLocaleString(), sum_traffic.toLocaleString(), sum_total.toLocaleString()]);
    };
    sheet_tab.getRange(last_result.length+5, 4, header.length, 5).setValues(header);
    sum_list["time"] = `${parseInt(sum_list["time"])}:${parseInt((sum_list["time"]-parseInt(sum_list["time"]))*60)}:00`;
    sum_list["money"] = sum_list["money"].toLocaleString();
    return [header, sum_list];
  }catch(e){
    log2spread(e);
  };
}

function lineMoney(month=1){
  try{
    var [table, sum_list] = money(month);
    Logger.log(table);
    Logger.log(sum_list);
    date = new Date();
    body1 = `${date.getMonth()+1-month}月のお賃金は～\n`;
    body2 = "";
    table.forEach((row, index) => {
      var [name, sum_time, sum_money, sum_traffic, sum] = row;
      if (index == 0){
        body1 += `${name}：${sum_time}\n`;
        body2 += `${name}：${sum}(${sum_money}+${sum_traffic})\n`;
        return;
      };
      body1 += `${name}\n\u3000\u3000：${sum_time}\n`;
      body2 += `${name}\n\u3000\u3000：${sum}円(${sum_money}+${sum_traffic})\n`;
    });
    body1 += "--------------------------------------------\n";
    body2 += "--------------------------------------------\n";
    body1 += `合計時間：${sum_list["time"]}\n\n`;
    body2 += `合計金額：${sum_list["money"]}円\n`
    body1 += body2;
    body1 += "\nです～";
    Logger.log(body1);
    line_push(body1);
  }catch(e){
    log2spread(e);
  };
}