function doGet(e) {
    
    var params = [];
    params = e.parameter.url.split('=');
    var endpoint = params[0];
    var query = encodeURIComponent(params[1]);
  
    var value;

    url = endpoint +'='+ query;
    //console.log('url:'+ url);
  
    if (url) {
        try{
            value = UrlFetchApp.fetch(url);
        }catch(e){
            console.log('url fetch error:'+ e);
        }    
    } else {
        value = { message: 'Please add api url.'};
    }
    var result = value;

    
    var out = ContentService.createTextOutput();

    //Mime TypeをJSONに設定
    out.setMimeType(ContentService.MimeType.JSON);

    //JSONテキストをセットする
    out.setContent(result);

    return out;
}
