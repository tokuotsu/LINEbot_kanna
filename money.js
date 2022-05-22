function getMyWorks(){
  var ss = SpreadsheetApp.openById(getProperty("my_ss_id"));
  var sheet_property = ss.getSheetByName("property");
  var table = sheet_property.getRange(2,1,20,7).getValues();
  var my_works = {};
  // Logger.log(table)
  table.forEach(row => {
    var [no, name, display_name, wage, traffic, start_date, end_date] = row;
    if (name!=""){
      my_works[name+`_${start_date}`] = [wage, traffic, [start_date,end_date], 0, 0, 0];
    };
  });
  Logger.log(my_works+"in getMyWorks");
  return my_works;
}

function makeTab(month=0) {
  try{
    var ss = SpreadsheetApp.openById(getProperty('my_ss_id'));
    var today = new Date();
    today.setMonth(today.getMonth() - month);
    var tab_name = Utilities.formatDate(today, "JST", "YYYYMM");
    if (!ss.getSheetByName(tab_name)){
      ss.insertSheet(tab_name);
      var sheetTarget = ss.getSheetByName(tab_name);
      sheetTarget.getRange(1,1,1,1).setValue(today.getMonth() + 1);
      sheetTarget.getRange(1,2,1,7).setValues([['名前','開始','終了','合計','時給単価','交通費','計']]);
      // Logger.log(year + month + day);
    };
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
  Logger.log(my_works);
  // dict[1.0].push("test")
  for (var name in my_works){
    var [start_ym, end_ym] = my_works[name][2];
    if (end_ym == ""){
      var tmp = new Date();
      tmp.setFullYear(tmp.getFullYear()+1);
      var end_ym = parseInt(Utilities.formatDate(tmp, "JST", "YYYYMM"));
    }
    var tmp_startTime = parseInt(Utilities.formatDate(startTime, "JST", "YYYYMM"))
    Logger.log(`${tmp_startTime}/${end_ym}/${start_ym}`);
    if (!(tmp_startTime <= end_ym & tmp_startTime >= start_ym)){
      Logger.log(name);
      delete my_works[name];
      continue;
    };
    work_calendars = calendar.getEvents(startTime, endTime, {search: name.split('_')[0]});
    work_calendars.forEach(work_calendar => {
      dict[work_calendar.getStartTime().getDate()].push(work_calendar);
    });
  };
  last_result = [];
  for (var name in my_works){
    var new_name = name.split('_')[0];
    my_works[new_name] = my_works[name];
    delete my_works[name];
  };
  Logger.log(dict);
  for (var day in dict){
    if (dict[day].length == 0){
      last_result.push([day, "", "", "", "", "", "", ""]);
      continue;
    };
    dict[day].some(event => {
      var name_original = event.getTitle();
      Logger.log(name.split(' '));
      name = name_original.split(' ')[0]; // 完全一致でないと辞書から読めない
      if (!(name in my_works)){
        return true;
      };
      var [wage, traffic, salary_date, _, _, _] = my_works[name];
      var st = event.getStartTime();
      var en = event.getEndTime();
      var hour = (en - st)/60/60/1000;
      var salary = parseInt(wage*hour);
      if (/.+(.+).*/.test(name_original)){
        var salary_result = /計:[0-9]+/.exec(name_original);
        var traffic_result = /交通費:[0-9]+/.exec(name_original);
        var wage_result = /時給:[0-9]+/.exec(name_original);
        var rest_result = /休憩:.*[0-9]+/.exec(name_original);
        if (salary_result != null){
          salary = parseInt(salary_result[0].split(":")[1]);
        };
        if (traffic_result != null){
          traffic = parseInt(traffic_result[0].split(":")[1]);
        };
        if (wage_result != null){
          wage = parseInt(wage_result[0].split(":")[1]);
        };
        if (rest_result != null){
          let rest = parseFloat(rest_result[0].split(":")[1]);
          hour -= rest;
          salary = parseInt(wage * hour);
        };
      };
      var hour_int = parseInt(hour);
      var min = parseInt((hour - hour_int) * 60);
      var min_org = ("0" + min).slice(-2);
      my_works[name][3] += salary;
      my_works[name][4] += traffic;
      my_works[name][5] += hour;
      last_result.push([day, name, makeDay(st), makeDay(en), `${hour_int}:${min_org}`, wage.toLocaleString(), traffic.toLocaleString(), (salary+traffic).toLocaleString()]);
    });
  };
  Logger.log(last_result);
  // Logger.log(my_works);
  return {0:last_result, 1:my_works}
}

function test(){
  var date = new Date();
  var month = -1;
  date.setMonth(date.getMonth()-month);
  // line_push(`${date}`);
  // Logger.log(Utilities.formatDate(date.setMonth(date.getMonth()-month), "JST", "YYYYMM"));
  Logger.log("202201202204".slice(0, 6));

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

function money(month=0){
  try{
    var ss = SpreadsheetApp.openById(getProperty("my_ss_id"));
    var date = new Date();
    date.setMonth(date.getMonth()-month);
    var tab_name = Utilities.formatDate(date, "JST", "YYYYMM");
    var sheet_tab = ss.getSheetByName(tab_name);
    if (!sheet_tab) {
      makeTab(month);
      sheet_tab = ss.getSheetByName(tab_name);
    };
    sheet_tab.getRange(1,2,1,7).set;
    var a = process(month);
    var last_result = a[0];
    var my_works = a[1];
    sheet_tab.getRange(1,1,1,1).setValue("a");
    sheet_tab.getRange(1,1,sheet_tab.getLastRow(),sheet_tab.getLastColumn()).clear();
    sheet_tab.getRange(1,1,1,1).setValue(`${date.getFullYear()}年${date.getMonth()+1}月`);
    sheet_tab.getRange(1,2,1,7).setValues([['名前','開始','終了','合計','時給単価','交通費','計']]);
    sheet_tab.getRange(2, 1, last_result.length, 8).setValues(last_result);
    var bandingList = ["LIGHT_GREY", "CYAN", "GREEN", "YELLOW", "ORANGE", "BLUE", "TEAL", "GREY", "BROWN", "LIGHT_GREEN", "INDIGO", "PINK"]
    sheet_tab.getRange(1, 1, last_result.length+1, 8).applyRowBanding(eval(`SpreadsheetApp.BandingTheme.${bandingList[date.getMonth()%12]}`));
    // Logger.log(last_result);
    // Logger.log(my_works);
    var header = [["名前", "合計時間", "給料","交通費","合計"]];
    var sum_list = {"time":0, "salary":0, "traffic":0}
    for (var name in my_works){
      var [_, _, _, sum_salary, sum_traffic, sum_time] = my_works[name];
      sum_list["time"] += sum_time;
      sum_list["salary"] += sum_salary;
      sum_list["traffic"] += sum_traffic;
      sum_time = `${parseInt(sum_time)}:${("0"+parseInt((sum_time-parseInt(sum_time))*60)).slice(-2)}:00`;
      Logger.log("sum_time:\n"+sum_time)
      header.push([name, sum_time, sum_salary.toLocaleString(), sum_traffic.toLocaleString(), (sum_salary + sum_traffic).toLocaleString()]);
    };
    // header.push(["", "", "", "", ""]);
    header.push(
      ["総計", 
      `${parseInt(sum_list["time"])}:${("0" + parseInt((sum_list["time"]-parseInt(sum_list["time"]))*60)).slice(-2)}:00`,
      sum_list["salary"].toLocaleString(),
      sum_list["traffic"].toLocaleString(),
      (sum_list["salary"] + sum_list["traffic"]).toLocaleString()
      ]
    );
    sheet_tab.getRange(last_result.length+5, 4, header.length, 5).setValues(header);
    sheet_tab.getRange(last_result.length+5, 4, 1, 5).setBorder(false, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THICK);
    sheet_tab.getRange(last_result.length+4+header.length, 4, 1, 5).setBorder(true, false, false, false, false, false, "black", SpreadsheetApp.BorderStyle.DOUBLE);
    sum_list["time"] = `${parseInt(sum_list["time"])}:${("0" + parseInt((sum_list["time"]-parseInt(sum_list["time"]))*60)).slice(-2)}:00`;
    return [header, sum_list];
  }catch(e){
    log2spread(e);
  };
}

function lineMoney(month=0){
  try{
    var [table, sum_list] = money(month);
    Logger.log(table);
    Logger.log(sum_list);
    date = new Date();
    body1 = `${date.getMonth()+1-month}月のお賃金は～\n`;
    body2 = "";
    table.forEach((row, index) => {
      var [name, sum_time, sum_salary, sum_traffic, total] = row;
      if (index == 0){
        body1 += `${name}：${sum_time}\n`;
        body2 += `${name}：${total}(${sum_salary}+${sum_traffic})\n`;
        return;
      };
      if (index == table.length-1){
        return;
      };
      body1 += `${name}\n\u3000\u3000：${sum_time}\n`;
      body2 += `${name}\n\u3000\u3000：${total}円(${sum_salary}+${sum_traffic})\n`;
    });
    body1 += "--------------------------------------------\n";
    body2 += "--------------------------------------------\n";
    body1 += `合計時間：${sum_list["time"]}\n\n`;
    body2 += `合計金額\n\u3000\u3000：${(sum_list["salary"]+sum_list["traffic"]).toLocaleString()}円(${sum_list["salary"].toLocaleString()}+${sum_list["traffic"].toLocaleString()})\n`
    body1 += body2;
    body1 += "\nです～";
    Logger.log(body1);
    line_push(body1);
  }catch(e){
    log2spread(e);
  };
}