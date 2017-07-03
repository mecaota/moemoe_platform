function getUrl() {
  var basedurl = 'https://docs.google.com/spreadsheets/d/';
  var paramurl = '/pubhtml?gid=52704471&single=true';
  var result = basedurl + getId() + paramurl;
  Logger.log(result);
  return result;
}

/////スプレッドシートサイド/////
var url = getUrl();

///getリクエストに対してレスポンスを帰す場合の関数群///
function doGet(request) {
Logger.log(url);
  var output = ContentService.createTextOutput();
  var data = {};
  var id = getId();
  var sheet = "フォームの回答 2";
  var ss = SpreadsheetApp.openById(id);
  setSchedule();
  
  var cell = request.parameters.cell;
  var youtubeid = request.parameters.id;
  var like = request.parameters.like;
  Logger.log(youtubeid);
  if((youtubeid)&&(like)){
    setLike(ss, sheet, youtubeid, like);
  }
  Logger.log("私達はここにいます");
  if (sheet) {
    if (cell) {
      data = ss.getSheetByName(sheet).getRange(cell).getValue();
    }else if(youtubeid){
      data['AdData'] = readData_(ss, sheet, youtubeid);
    } else {
      data['AdData'] = readData_(ss, sheet);
    }
  } else {
      // Grab all sheets except those with a name
      // that starts with an underscore
    ss.getSheets().forEach(function(oSheet, iIndex) {
      var sName = oSheet.getName();
      if (! sName.match(/^_/)) {
        data[sName] = readData_(ss, sName);
      }
    })
  }
  var result = cell ? data : JSON.stringify(data);
  var callback = request.parameters.callback;
  if (callback == undefined) {
    output.setContent(result);
    output.setMimeType(cell ? ContentService.MimeType.TEXT : ContentService.MimeType.JSON);
  }else {
    output.setContent(callback + "(" + result + ")");
    output.setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return output;
}

//いいね追加
function setLike(ss, sheetname, youtubeid, like){
  var sh = ss.getSheetByName(sheetname);
  var target = getTitle('動画のURL', sh);
  var row = getAdColumn(ss, sheetname, youtubeid);
  if(row<2){
    return 0;
  }
  Logger.log("いいね前と後");
  Logger.log(Number(sh.getRange(row, target).getValue()));
  Logger.log(Number(like));
  target = getTitle('Like', sh);
  var count = Number(sh.getRange(row, target).getValue()) + Number(like);
  if(count>999){
    count=999;
  }
  var result = sh.getRange(row, target).setValue(count);
  Logger.log(count);
  return count;
}
  
  //シートからデータを読みだす
function readData_(ss, sheetname, youtubeid, properties) {
  var sh = ss.getSheetByName(sheetname);
  if (typeof properties == "undefined") {
    properties = getHeaderRow_(ss, sheetname);
    properties = properties.map(function(p) { return p.replace(/\s+/g, '_'); });
  }
  var rows;
  var number;
  //youtubeidの指定がある場合に読み出す
  if(youtubeid){
    number = getAdColumn(ss, sheetname, youtubeid);
  }
  rows = getDataRows_(ss, sheetname, number);
  var data = [];
  if(!rows){
    return null;
  }
  for (var r = 0, l = rows.length; r < l; r++) {
    var row = rows[r];
    var record = {};
    if(row[1]!=''){
      for (var p in properties) {
      record[properties[p]] = convert_(row[p]);
      }
      data.push(record);
    }
  }
  return data;
}
  
//値をブーリアン型に変換
function convert_(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

//行のデータを取得
function getDataRows_(ss, sheetname, number) {
  var sh = ss.getSheetByName(sheetname);
   //セルのスケジュール範囲内参照した場合にシートの然るべき範囲の値を返す
  if((number) && (number > 1)){
    return sh.getRange(Number(number), 1, 1, sh.getLastColumn()).getValues();
  }else if((number) && (number < 0)){
    return null;
  }
  Logger.log(sh.getLastRow());
  return sh.getRange(2, 1, sh.getLastRow()-1, sh.getLastColumn()).getValues();
}
  
//ヘッダ部分（項目名）の取得
function getHeaderRow_(ss, sheetname) {
  var sh = ss.getSheetByName(sheetname);
  var titles = convert_titles_(sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0]);
  return titles;
}

function convert_titles_(titles){
  for(var i=0; i<titles.length; i++){
    switch(titles[i]){
      case 'タイムスタンプ':
        titles[i]='TimeStamp';
        break;
      case 'イベントのタイトル':
        titles[i]='EventTitle';
        break;
      case 'イベントの説明':
        titles[i]='EventDescription';
        break;
      case '掲示期間':
        titles[i]='Period';
        break;
      case '動画のURL':
        titles[i]='VideoId';
        break;
      case '表示場所':
        titles[i]='ScreenPosition';
        break;
    }
  }
  return titles;
}

//youtubeidから紐付けられた広告データの行を取得
function getAdColumn(ss, sheetname, id){
  var sh = ss.getSheetByName(sheetname)
  var target = getTitle('動画のURL', sh);
  for(var j = 2; j <= sh.getLastRow(); j++){
    var value = sh.getRange(j, target).getValue();
    if(value == id){
      return j;
    }
  }
  return -1;
}

//スプレッドシート内に書き込まれたデータを整形する
function onSubmitForm(e){
  var videoid = String(e.namedValues["動画のURL"]);
  Logger.log("VideoID is");
  Logger.log(videoid);
  videoid = getYoutube(videoid);
  Logger.log(videoid);
  var listid = Number(e.namedValues["表示場所"]);
  listid = selectStage(listid);
  Logger.log(listid);
  var row = e.range.getRow();
  var sh = SpreadsheetApp.getActiveSheet();
  //動画URLのシートを検索して列を取得し、最後尾の行のURLを書き換える
  var target = getTitle('動画のURL', sh);
  sh.getRange(row, target).setValue(videoid);
  listInsert(videoid, listid);
  target = getTitle('Like', sh);
  sh.getRange(row, target).setValue('0');
}
  
//指定された文字列から列数を検索
function getTitle(target, sh){
  if(sh){
   for(var i = 1; i <=sh.getLastColumn(); i++){
     var title = sh.getRange(1, i).getValue();//列のタイトルを取得
     if(title == target){
       return i;
     }
   }
  }
  return null;
}

//

//期間判定関数
function setSchedule(){
  var sheetname = "フォームの回答 2";
  var id = "";
  var ss = SpreadsheetApp.openById(id);
  var sh = ss.getSheetByName(sheetname);
  
  
  var title2 = getTitle('掲示期間' ,sh);
  for(var j = 2; j <= sh.getLastRow(); j++){//セルの中身を取得
    var data = new Date(sh.getRange(j, title2).getValue());
    data.setDate(data.getDate() + 1);
    var nowtime = new Date();
    data = data.getTime() - nowtime.getTime();
    if(data < 0){
      var videoid = sh.getRange(j, getTitle('動画のURL', sh)).getValue();
      var listname = sh.getRange(j, getTitle('表示場所', sh)).getValue();
      var listid = selectStage(listname);
      listDelete(videoid, listid);
      sh.deleteRow(j); //該当行を削除
    }else{
    }
  }
}

function sort(ss, sheetname){
  var sh = ss.getSheetByName(sheetname);
  var titlenum = getTitle('期間判定', sh);
  var range = sh.getRange(2, 1, sh.getLastRow(), sh.getLastColumn());
  range.sort([{column: titlenum, ascending: false}]);
}

//youtubeURLから動画IDへ変換
function getYoutube(yurl){
  ///動画ID抜き出し///
  if(yurl.indexOf("/")<0){
    return yurl;
  }
  //fullURL用//
  var regExp = new RegExp(/.*v=([-\d\w]+).*/);
  var nukidasi = regExp.exec(yurl);
  //短縮URL用//
  var regExp_s = new RegExp(/\/.*\/([-\d\w]+)/);
  var nukidasi_s = regExp_s.exec(yurl);
  //通常URLと短縮URL判別//
  if(nukidasi != null){
    var id = nukidasi[1];
  }else if(nukidasi_s != null){
    var id = nukidasi_s[1];
  }else{
    var id = "";
  }
  yurl = id;
  return yurl;
}



/////Youtubeサイド/////
function listInsert(videoid, listname){
  var details = {
    videoId: videoid,
    kind: 'youtube#video'
  }
  
  var part= 'snippet';
  var resource = {
    snippet: {
    playlistId: listname,
    resourceId: details
    }
  };
  var insertedVideo = [];
  var playlistinsert = YouTube.PlaylistItems.insert(resource, part);
  
  insertedVideo.push(playlistinsert.snippet);
  Logger.log("Insert Video to Playlist");
  Logger.log(insertedVideo);
}

function listDelete(videoid, listname){
  if((videoid == null) || (listname == null)){
    return 0;
  }
  var result = YouTube.PlaylistItems.list('id', {playlistId: listname, videoId: videoid}).items;
  while(result.length>0){
    var deletedVideo = YouTube.PlaylistItems.remove(result.pop().id);
    Logger.log("Delete Video from Playlist");
    Logger.log(deletedVideo);
  }
}