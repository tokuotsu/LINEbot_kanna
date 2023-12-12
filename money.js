function getMyWorks(){
  // porpertyタブから情報読み込み
  var ss = SpreadsheetApp.openById(getProperty("my_ss_id"));
  var sheet_property = ss.getSheetByName("property");
  var table = sheet_property.getRange(2,1,30,11).getValues();
  var my_works = {};
  // Logger.log(table)
  table.forEach(row => {
    var [no, name, pay_date, unit_wage, fare, start_date, end_date, normal_work_hour, normal_salary, overtime_unit_wage, name_overtime] = row;
    // log2spread_normal(`${name}${unit_wage}${fare}${start_date}${end_date}`);
    Logger.log(no, name, pay_date, unit_wage, fare, start_date, end_date, normal_work_hour, normal_salary, overtime_unit_wage);
    // my_worksに連想配列を追加
    if (name!=""){
      my_works[`${name}_${start_date}`] = {
        no: no, // no
        pay_date: pay_date, // 振込日
        unit_wage: unit_wage,  // 時間単価
        fare: fare,  // 交通費
        date: [start_date, end_date], // その仕事の開始時期と終了時期 
        normal_work_hour: normal_work_hour,  // 定時時間(7.5など)
        normal_salary: normal_salary,  // 月基本給
        overtime_unit_wage: overtime_unit_wage, // 残業がある場合の時間単価
        name_overtime: name_overtime, // 残業の呼び名
        salary_sum: 0, // 給料合計
        salary_overtime_sum: 0, // 残業合計
        fare_sum: 0, // 交通費合計
        hour_sum: 0, // 労働時間合計
        normal_hour_sum: 0, // 定時時間合計
        over_hour_sum: 0, // 残業時間合計
        overtime_count:0 // 残業カウント用
      };
    };
  });
  Logger.log(my_works["仕事_202304"]["no"]+"in getMyWorks");
  // line_push(`${my_works}`)
  // log2spread()
  return my_works;
}

// 毎月新しいタブを作成する
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
      sheetTarget.getRange(1,2,1,7).setValues([['名前','開始','終了', '残業時間','合計時間','時給単価','交通費', '時間外賃金', '計']]);
      // Logger.log(year + month + day);
      // TODO: 直近12カ月分のみ表示したい。
    };
  }catch(e){
    log2spread(e);
  };
}

// dateオブジェクトを変換
function makeDay(date){
  return Utilities.formatDate(date, "JST", "HH':'mm")
}

// Googleカレンダーからその月のイベントのうちpropertyにあるものを抜き出す
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
    var [start_ym, end_ym] = my_works[name]["date"];
    if (end_ym == ""){
      var tmp = new Date();
      tmp.setFullYear(tmp.getFullYear()+1);
      var end_ym = parseInt(Utilities.formatDate(tmp, "JST", "YYYYMM"));
    }
    var tmp_startTime = parseInt(Utilities.formatDate(startTime, "JST", "YYYYMM"))
    Logger.log(`${tmp_startTime}/${end_ym}/${start_ym}`);
    if (!(tmp_startTime <= end_ym && tmp_startTime >= start_ym)){
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
  // 名前をpropertyのnameに
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
    for (var no_event in dict[day].sort((a,b)=>a.getStartTime() - b.getStartTime())){
      var event = dict[day][no_event];
      var name_original = event.getTitle();
      Logger.log(name.split(' '));
      name = name_original.split(' ')[0]; // 完全一致でないと辞書から読めない
      if (!(name in my_works)){
        continue;
      };
      var unit_wage = my_works[name]["unit_wage"];
      var fare = my_works[name]["fare"];
      var normal_work_hour = my_works[name]["normal_work_hour"];

      var st = event.getStartTime();
      // Logger.log("st.date")
      var en = event.getEndTime();
      var work_hour = (en - st)/60/60/1000;
      if (work_hour == 24){
        continue;
      }
      if (/.+(.+).*/.test(name_original)){
        var salary_result = /計:[0-9]+/.exec(name_original);
        var traffic_result = /交通費:[0-9]+/.exec(name_original);
        var wage_result = /時給:[0-9]+/.exec(name_original);
        var rest_result = /休憩:.*[0-9]+/.exec(name_original);
        if (rest_result != null){
          let rest = parseFloat(rest_result[0].split(":")[1]);
          work_hour -= rest;
        };
        if (traffic_result != null){
          fare = parseInt(traffic_result[0].split(":")[1]);
        };
        if (wage_result != null){
          unit_wage = parseInt(wage_result[0].split(":")[1]);
        };
        if (salary_result != null){
          salary = parseInt(salary_result[0].split(":")[1]);
        };
      };
      var salary = Math.ceil(unit_wage * work_hour);

      if (name=="仕事") {
        salary = Math.ceil(unit_wage * normal_work_hour);
        var overtime_unit_wage = my_works[name]["overtime_unit_wage"];
        var hour_overtime = Math.max(0, work_hour - normal_work_hour);
        var salary_overtime = Math.ceil(hour_overtime * overtime_unit_wage);
        last_result.push([
          day, 
          name, 
          makeDay(st), 
          makeDay(en),
          displayTime(hour_overtime),
          displayTime(work_hour),
          unit_wage.toLocaleString("ja-JP"), 
          fare.toLocaleString("ja-JP"), 
          salary_overtime.toLocaleString("ja-JP"), 
          (salary + fare + salary_overtime).toLocaleString("ja-JP")
        ]);
        my_works[name]["salary_overtime_sum"] += salary_overtime;
        my_works[name]["over_hour_sum"] += hour_overtime;
        if (en < new Date()){
          my_works[name]["overtime_count"] += 1;
        };
      } else {
        last_result.push([
          day, 
          name, 
          makeDay(st), 
          makeDay(en),
          "0:00",
          displayTime(work_hour),
          unit_wage.toLocaleString("ja-JP"), 
          fare.toLocaleString("ja-JP"), 
          "0", 
          (salary + fare).toLocaleString("ja-JP")
        ]);
      };

      my_works[name]["salary_sum"] += salary;
      my_works[name]["fare_sum"] += fare;
      my_works[name]["hour_sum"] += work_hour;
      my_works[name]["normal_hour_sum"] += normal_work_hour;
    };
  };
  Logger.log(last_result);
  // Logger.log(my_works);
  return {0:last_result, 1:my_works}
}

function money(month=0){
  try{
    var ss = SpreadsheetApp.openById(getProperty("my_ss_id"));
    var date = new Date();
    date.setMonth(date.getMonth() - month);
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
    var sum_dict = {
      "SUM_WORK_TIME":0, 
      "SUM_SALARY":0, 
      "SUM_FARE":0, 
      "SUM_PAY":0, 
    }
    for (var name in my_works){
      var hour_sum = my_works[name]["hour_sum"];
      var salary_sum = my_works[name]["salary_sum"];
      var fare_sum = my_works[name]["fare_sum"];
      
      if (name == "仕事") {
        var normal_hour_sum = my_works[name]["normal_hour_sum"]; // 仕事の時のみ
        var normal_salary = my_works[name]["normal_salary"]; // 仕事の時のみ
        var over_hour_sum =my_works[name]["over_hour_sum"];
        var overtime_count = my_works[name]["overtime_count"];
        var overtime_unit_wage = my_works[name]["overtime_unit_wage"];
        // var salary_overtime_sum = my_works[name]["salary_overtime_sum"];
        // 残業時間は繰り上げのため
        var salary_overtime_sum = Math.ceil(overtime_unit_wage * parseInt(over_hour_sum + 59/60));
        sum_dict["SUM_WORK_TIME"] += normal_hour_sum + over_hour_sum;
        sum_dict["SUM_SALARY"] += normal_salary + salary_overtime_sum;
        sum_dict["SUM_PAY"] += normal_salary + salary_overtime_sum + fare_sum;
      } else {
        sum_dict["SUM_WORK_TIME"] += hour_sum;
        sum_dict["SUM_SALARY"] += salary_sum;
        sum_dict["SUM_PAY"] += salary_sum + fare_sum;
      }
      sum_dict["SUM_FARE"] += fare_sum;
      
      // 仕事のみ残業代を追加
      if (name == "仕事") {
        header.push([
          name,
          displayTime(normal_hour_sum),
          normal_salary.toLocaleString("ja-JP"),
          fare_sum.toLocaleString("ja-JP"),
          (normal_salary + fare_sum).toLocaleString("ja-JP")
        ]);
        header.push([
          my_works[name]["name_overtime"],
          `${displayTime(over_hour_sum)}(${parseInt(over_hour_sum + 59/60)}時間)`,
          salary_overtime_sum.toLocaleString("ja-JP"),
          0,
          salary_overtime_sum.toLocaleString("ja-JP")
        ]);
      } else {
        header.push([
          name,
          displayTime(hour_sum),
          salary_sum.toLocaleString("ja-JP"),
          fare_sum.toLocaleString("ja-JP"),
          (salary_sum + fare_sum).toLocaleString("ja-JP")
        ]);
      };
    };

    // 最終行の合計
    header.push([
      "総計", 
      displayTime(sum_dict["SUM_WORK_TIME"]),
      sum_dict["SUM_SALARY"].toLocaleString("ja-JP"),
      sum_dict["SUM_FARE"].toLocaleString("ja-JP"),
      sum_dict["SUM_PAY"].toLocaleString("ja-JP")
      ]
    );
    const first_column = 6;
    sheet_tab.getRange(last_result.length+5, first_column, header.length, 5).setValues(header);
    sheet_tab.getRange(last_result.length+6, first_column+1, header.length, 1).setNumberFormat("[h]:mm")
    sheet_tab.getRange(last_result.length+5, first_column, 1, 5).setBorder(false, false, true, false, false, false, "black", SpreadsheetApp.BorderStyle.SOLID_THICK);
    sheet_tab.getRange(last_result.length+4+header.length, first_column, 1, 5).setBorder(true, false, false, false, false, false, "black", SpreadsheetApp.BorderStyle.DOUBLE);

    var thisMonth = sheet_tab.getRange(1,1,1,1).getValue();
    // 円グラフの作成
    makeChart(
      sheet_tab, 
      sheet_tab.getRange(last_result.length+5, first_column, header.length-1, 1), 
      sheet_tab.getRange(last_result.length+5, first_column+4, header.length-1, 1)
      );
    // 棒グラフの作成
    makeBarChart(
      sheet_tab, 
      sheet_tab.getRange(1, 1, last_result.length+1, 1), 
      sheet_tab.getRange(1, 5, last_result.length+1, 1), 
      sheet_tab.getRange(1, 9, last_result.length+1, 1), 
      `${thisMonth.getMonth()+1}月の残業時間（平均${displayTime(over_hour_sum/overtime_count)}）`
      );
    try{
      sheet_tab.deleteColumns(11, 15);
    }catch{
      try{
        sheet_tab.deleteRows(last_result.length+40, 1000-(last_result.length+40));
      }catch{;}
    }
    return [header, sum_dict];
  } catch(e) {
    log2spread(e);
  };
}

function displayTime(hour){
  return `${parseInt(hour)}:${("0"+parseInt((hour-parseInt(hour))*60)).slice(-2)}`;
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

function lineMoney(month=0){
  try{
    var [table, sum_dict] = money(month);
    Logger.log(table);
    Logger.log(sum_dict);
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
    body1 += `合計時間：${sum_dict["time"]}\n\n`;
    body2 += `合計金額\n\u3000\u3000：${sum_dict["SUM_PAY"].toLocaleString("ja-JP")}円(${sum_dict["SUM_SALARY"].toLocaleString("ja-JP")}+${sum_dict["SUM_FARE"].toLocaleString("ja-JP")})\n`
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
    .setPosition(42,6,3,5)
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
    .setPosition(42,1,3,5)
    .setOption('isStacked', 'true')
    .setOption('title', title)
    .setOption('width', 500)
    .setOption('height', 300);
  sheet.insertChart(chart.build());
}