// @ts-nocheck
var ss = SpreadsheetApp.openById('1XNXhzU5bnWCMXF15hqLdDgd7z3Z2S3rOHjzHjJDJFgY');
var today = new Date();
var year = parseInt(today.getFullYear());
var month = today.getMonth() + 1;
var month = ("0" + month).slice(-2);
var tabName = year + month;
var sheetTarget = ss.getSheetByName(tabName);
var sheetProperty = ss.getSheetByName('property');
var calendar = CalendarApp.getCalendarById('t.tokuhiro0317@gmail.com');
var tutors = [];
var chrystalMethods = [];
var array = [["家庭教師"],["クリスタルメソッド"],["合計時間"],[""],["家庭教師"],["クリスタルメソッド"],["合計金額"]];

function makeTab() {
  ss.insertSheet(tabName)
  var sheetTarget = ss.getSheetByName(tabName);
  sheetTarget.getRange(1,1,1,1).setValue(month);
  sheetTarget.getRange(1,2,1,7).setValues([['名前','開始','終了','合計','時給単価','交通費','計']]);
  // Logger.log(year + month + day);
}

function makeTime(time) {
  var h = time.getHours();
  var h = ("0" + h).slice(-2);
  var m = time.getMinutes();
  var m = ("0" + m).slice(-2);
  return h + ':' +m;
}

function makeTime2(time){
  var int = parseInt(time)
  var float = time - int
  var min = Math.round(float*60)
  min = ("0" + min).slice(-2)
  return int + ':' + min
}

function money(){
  var startTime = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
  var endTime = new Date(today.getFullYear(), today.getMonth()+1, 0, 23, 59,59);
  chrystalMethods = calendar.getEvents(startTime, endTime, {search: 'クリスタルメソッド'});
  tutors = calendar.getEvents(startTime, endTime, {search: '家庭教師'});
  var list = chrystalMethods.concat(tutors);
  var index = new Array(list.length);
  var dates = new Array(list.length);

  var matome = [[0,0,0], [0,0,0]];

  for (var i = 0; i<list.length; i++) {
    index[i] = new Array(8)
    index[i][0] = list[i].getStartTime().getDate();
    index[i][1] = list[i].getTitle();
    index[i][2] = list[i].getStartTime();
    index[i][3] = list[i].getEndTime();
    index[i][4] = (list[i].getEndTime() - list[i].getStartTime())/3600000;
    if (index[i][1].indexOf("クリスタルメソッド")!=-1){
      index[i][5] = 1100;
      index[i][6] = 616;
    }else{
      index[i][5] = 5000;
      index[i][6] = 0;
    }
    index[i][7] = parseInt(index[i][4]*index[i][5]+index[i][6]);

    if (index[i][1].indexOf("クリスタルメソッド")!=-1){
      matome[1][0] += index[i][4];
      matome[1][1] += index[i][7];
      matome[1][2] += index[i][6];
    }else{
      matome[0][0] += index[i][4];
      matome[0][1] += index[i][7];
      matome[0][2] += index[i][6];
    }

    dates[i] = list[i].getStartTime().getDate();
  }
  // Logger.log(dates)
  for (var i = 1; i<=endTime.getDate(); i++){
    if (dates.indexOf(i)==-1){
      index.push([i,"","","","","","",""]);
    }
  }
  // index.sort(function(a,b){return(a[2] - b[2])})
  index.sort(function(a,b){if (a[0] - b[0] != 0){return(a[0] - b[0]);}else{return(a[2] - b[2]);}});
  for (var i = 0; i<index.length; i++){
    if (index[i][2] != ""){
      index[i][2] = makeTime(index[i][2]);
      index[i][3] = makeTime(index[i][3]);
      index[i][4] = makeTime2(index[i][4])
    }
  }

  // Logger.log(index);
  sheetTarget.getRange(2,1,index.length,8).setValues(index)
  // for (var i = 0; i<matome.length; i++){
  array[0].push(makeTime2(matome[0][0]));
  array[1].push(makeTime2(matome[1][0]));
  array[2].push(makeTime2(matome[0][0]+matome[1][0]));
  array[3].push([""]);
  array[4].push(matome[0][1]);
  array[5].push(matome[1][1]);
  array[6].push(matome[0][1]+matome[1][1]);
  // }
  sheetTarget.getRange(26,10,7,2).setValues(array)
  // Logger.log(array)
  // Logger.log(times)
}

function lineMoney(){
  var today = new Date()
  var year = parseInt(today.getFullYear());
  var month = today.getMonth() + 1;
  var month = ("0" + month).slice(-2);
  var tabName = year + month;
  var sheetTarget = ss.getSheetByName(tabName);
  var array = sheetTarget.getRange(26,10,7,2).getValues();
  var ans = ""
  line_push("今月のお給料は～")
  sleep(4000);
  for (var i = 0; i<3; i++){
    array[i][1] = makeTime(array[i][1])
    // Logger.log(array[i][1])
  }
  for each (var arra in array){
    ans += arra
    ans += "\n"
  }
  ans += "です～"
  line_push(ans)
}