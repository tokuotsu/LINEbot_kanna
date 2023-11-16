function getMyWorks(){
  var ss = SpreadsheetApp.openById(getProperty("my_ss_id"));
  var sheet_property = ss.getSheetByName("property");
  var table = sheet_property.getRange(2,1,30,7).getValues();
  var my_works = {};
  // Logger.log(table)
  table.forEach(row => {
    var [no, name, display_name, wage, traffic, start_date, end_date] = row;
    // log2spread_normal(`${name}${wage}${traffic}${start_date}${end_date}`);
    if (name!=""){
      my_works[name+`_${start_date}`] = [wage, traffic, [start_date,end_date], 0, 0, 0, 270000, 2311.12, 0];
    };
  });
  Logger.log(my_works+"in getMyWorks");
  // line_push(`${my_works}`)
  // log2spread()
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
      sheetTarget.getRange(1,2,1,7).setValues([['名前','開始','終了', '残業時間','合計時間','時給単価','交通費','計']]);
      // Logger.log(year + month + day);
      // TODO: 直近12カ月分のみ表示したい。
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
      last_result.push([day, "", "", "", "", "", "", "", "", ""]);
      continue;
    };
    for (var i in dict[day].sort((a,b)=>a.getStartTime() - b.getStartTime())){
      var event = dict[day][i];
      var name_original = event.getTitle();
      Logger.log(name.split(' '));
      name = name_original.split(' ')[0]; // 完全一致でないと辞書から読めない
      if (!(name in my_works)){
        continue;
      };
      var [wage, traffic, salary_date, _, _, _, baseWage, offHoursUnitWage, _] = my_works[name];
      var st = event.getStartTime();
      // Logger.log("st.date")
      var en = event.getEndTime();
      var hour = (en - st)/60/60/1000;
      if (hour == 24){
        continue;
      }
      if (/.+(.+).*/.test(name_original)){
        var salary_result = /計:[0-9]+/.exec(name_original);
        var traffic_result = /交通費:[0-9]+/.exec(name_original);
        var wage_result = /時給:[0-9]+/.exec(name_original);
        var rest_result = /休憩:.*[0-9]+/.exec(name_original);
        if (rest_result != null){
          let rest = parseFloat(rest_result[0].split(":")[1]);
          hour -= rest;
          // salary = parseInt(wage * hour);
        };
        if (traffic_result != null){
          traffic = parseInt(traffic_result[0].split(":")[1]);
        };
        if (wage_result != null){
          wage = parseInt(wage_result[0].split(":")[1]);
        };
      };
      var salary = parseInt(wage*hour);
      if (salary_result != null){
        salary = parseInt(salary_result[0].split(":")[1]);
      };
      var hour_int = parseInt(hour);
      var hour_overtime_int = parseInt(hour-7.5);
      var min = parseInt((hour - hour_int) * 60);
      var min_overtime = parseInt((hour -7.5 - hour_overtime_int) * 60);
      var min_org = ("0" + min).slice(-2);
      var min_overtime_org = ("0" + min_overtime).slice(-2);
      my_works[name][3] += salary;
      my_works[name][4] += traffic;
      my_works[name][5] += hour;
      if (name === "仕事") {
        my_works[name][8] += hour - 7.5;
      }
      last_result.push([day, name, makeDay(st), makeDay(en),`${hour_overtime_int}:${min_overtime_org}` , `${hour_int}:${min_org}`, wage.toLocaleString("ja-JP"), traffic.toLocaleString("ja-JP"), parseInt((hour - 7.5) * my_works[name][7]).toLocaleString("ja-JP"), (salary+traffic).toLocaleString("ja-JP")]);
    };
  };
  Logger.log(last_result);
  // Logger.log(my_works);
  return {0:last_result, 1:my_works}
}

function test(){
  var date = new Date();
  var month = -1;
  var name_original = "休憩:0.5";
  var rest_result = /休憩:.*[0-9]+/.exec(name_original);
  Logger.log(rest_result);
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
    sheet_tab.getRange(1,2,1,9).setValues([['名前','開始','終了', '残業時間', '合計時間','時給単価','交通費', '時間外賃金', '計']]);
    sheet_tab.getRange(2, 1, last_result.length, 10).setValues(last_result);
    var bandingList = ["LIGHT_GREY", "CYAN", "GREEN", "YELLOW", "ORANGE", "BLUE", "TEAL", "GREY", "BROWN", "LIGHT_GREEN", "INDIGO", "PINK"]
    sheet_tab.getRange(1, 1, last_result.length+1, 10).applyRowBanding(eval(`SpreadsheetApp.BandingTheme.${bandingList[date.getMonth()%12]}`));
    // Logger.log(last_result);
    // Logger.log(my_works);
    var header = [["名前", "合計時間", "給料","交通費","合計"]];
    var sum_list = {"time":0, "salary":0, "traffic":0, "offHours":0, "offHoursSumWage":0}
    for (var name in my_works){
      if (name === "残業代") {
        var [_, _, _, sum_salary, sum_traffic, sum_time, baseWage, offHoursUnitWage, offHours] = my_works["仕事"];
      } else {
        var [_, _, _, sum_salary, sum_traffic, sum_time, baseWage, _, _] = my_works[name];
      }
      // log2spread_normal(sum_salary)
      if (name === "仕事") {
        sum_list["time"] += sum_time;
        sum_list["salary"] += baseWage
        sum_list["traffic"] += sum_traffic;
      } else if (name === "残業代") {
        sum_list["time"] += offHours;
        sum_list["salary"] += offHours * offHoursUnitWage;
      }else {
        sum_list["time"] += sum_time;
        sum_list["salary"] += sum_salary;
        sum_list["traffic"] += sum_traffic;
      }
      sum_time = `${parseInt(sum_time)}:${("0"+parseInt((sum_time-parseInt(sum_time))*60)).slice(-2)}:00`;
      offHours_display = `${parseInt(offHours)}:${("0"+parseInt((offHours-parseInt(offHours))*60)).slice(-2)}:00`;
      Logger.log("sum_time:\n"+sum_time);
      if (name === "仕事") {
        header.push([name, sum_time, (baseWage).toLocaleString("ja-JP"), sum_traffic.toLocaleString("ja-JP"), (baseWage + sum_traffic).toLocaleString("ja-JP")]);
      } else if (name === "残業代") {
        header.push([name, offHours_display, parseInt(offHours * offHoursUnitWage).toLocaleString("ja-JP"), 0, parseInt(offHours * offHoursUnitWage).toLocaleString("ja-JP")]);
      } else {
        header.push([name, sum_time, sum_salary.toLocaleString("ja-JP"), sum_traffic.toLocaleString("ja-JP"), (sum_salary + sum_traffic).toLocaleString("ja-JP")]);
      }
    };
    // header.push(["", "", "", "", ""]);
    header.push(
      ["総計", 
      `${parseInt(sum_list["time"])}:${("0" + parseInt((sum_list["time"]-parseInt(sum_list["time"]))*60)).slice(-2)}:00`,
      sum_list["salary"].toLocaleString("ja-JP"),
      sum_list["traffic"].toLocaleString("ja-JP"),
      parseInt(sum_list["salary"] + sum_list["traffic"]).toLocaleString("ja-JP")
      ]
    );

    sheet_tab.getRange(last_result.length+5, 5, header.length, 5).setValues(header);
    sheet_tab.getRange(last_result.length+6, 6, header.length, 1).setNumberFormat("[h]:mm:ss")
    sheet_tab.getRange(last_result.length+5, 5, 1, 5).setBorder(false, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THICK);
    sheet_tab.getRange(last_result.length+4+header.length, 5, 1, 5).setBorder(true, false, false, false, false, false, "black", SpreadsheetApp.BorderStyle.DOUBLE);
    sum_list["time"] = `${parseInt(sum_list["time"])}:${("0" + parseInt((sum_list["time"]-parseInt(sum_list["time"]))*60)).slice(-2)}:00`;
    var thisMonth = sheet_tab.getRange(1,1,1,1).getValue();
    // 円グラフの作成
    makeChart(sheet_tab, sheet_tab.getRange(last_result.length+5, 5, header.length-1, 1), sheet_tab.getRange(last_result.length+5, 9, header.length-1, 1));
    // 棒グラフの作成
    makeBarChart(sheet_tab, sheet_tab.getRange(1, 1, last_result.length+1, 1), sheet_tab.getRange(1, 5, last_result.length+1, 1), sheet_tab.getRange(1, 9, last_result.length+1, 1), `${thisMonth.getMonth()+1}月の残業時間`);
    try{
      sheet_tab.deleteColumns(11, 15);
    }catch{
      try{
        sheet_tab.deleteRows(last_result.length+40, 1000-(last_result.length+40));
      }catch{;}
    }
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
    body2 += `合計金額\n\u3000\u3000：${(sum_list["salary"]+sum_list["traffic"]).toLocaleString("ja-JP")}円(${sum_list["salary"].toLocaleString("ja-JP")}+${sum_list["traffic"].toLocaleString("ja-JP")})\n`
    body1 += body2;
    body1 += "\nです～";
    Logger.log(body1);
    line_push(body1);
  }catch(e){
    log2spread(e);
  };
}

function makeChart(sheet, range1, range2){
  var charts = sheet.getCharts();
  // Logger.log(chart)
  charts.forEach(chart => {
    if (chart.length != 0){
      sheet.removeChart(chart);
    }
  })
  var chart = sheet.newChart()
    .addRange(range1)
    .addRange(range2)
    .setChartType(Charts.ChartType.PIE)
    .setPosition(40,6,3,5)
    .setOption('width', 500)
    .setOption('height', 300);
    // .setOption('title', 'test');
  sheet.insertChart(chart.build());
}

function makeBarChart(sheet, range1, range2, range3, title){
  var chart = sheet.getCharts()[0];
  // Logger.log(chart)
  var chart = sheet.newChart()
    .addRange(range1)
    .addRange(range2)
    // .addRange(range3)
    .asColumnChart()
    .setPosition(40,1,3,5)
    .setOption('isStacked', 'true')
    .setOption('title', title)
    .setOption('width', 500)
    .setOption('height', 300);
  sheet.insertChart(chart.build());
}