(function () {
    var myConnector = tableau.makeConnector();
    
    var resas_api_prefcode_url = "https://opendata.resas-portal.go.jp/api/v1/prefectures";
    var resas_api_citycode_url = "https://opendata.resas-portal.go.jp/api/v1/cities";
    var resas_api_url = "https://opendata.resas-portal.go.jp/api/v1/municipality/foundation/perYear";
    var prefectureArray = [];
    var cityArray = [];
    

    
    //スキーマ定義
    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id : "prefCode", alias : "県コード", dataType : tableau.dataTypeEnum.string },
            { id : "prefName", alias : "県名", dataType : tableau.dataTypeEnum.string },
            { id : "cityCode", alias : "市区町村コード", dataType : tableau.dataTypeEnum.string },
            { id : "cityName", alias : "市区町村名", dataType : tableau.dataTypeEnum.string },
            { id : "year", alias : "年", dataType : tableau.dataTypeEnum.string },
            { id : "value", alias : "創業比率", dataType : tableau.dataTypeEnum.int}
        ];

        var tableInfo = {
            id : "Foundation",
            alias : "創業比率",
            columns : cols
        };

        schemaCallback([tableInfo]);
    };

    //スリープ処理関数
    function sleep(msec) {
        return new Promise(function(resolve) {
            setTimeout(function() {resolve()}, msec);
        })
    };

    //コネクタにデータを登録
    var deferredObj = $.Deferred();
    myConnector.getData = function(table, doneCallback) {
        var tableData = []; 
        var resas_api_key = JSON.parse(tableau.connectionData).api_key;
        
        //都道府県コード取得
        console.log('X-API-KEY:'+resas_api_key);
        var xhr = $.ajax({
            type: 'GET',
            url: resas_api_prefcode_url,
            dataType: 'json',
            scriptCharset: 'utf-8',
            headers: { 'X-API-KEY': resas_api_key },
            async: false
        }).done(function(resp) {
            resp.result.forEach(function(data) { prefectureArray.push(data); });
            console.log("fetching pref data :"+ JSON.stringify(resp) );
        }).fail(function() {
            tableau.abortWithError('An error has occured while trying to connect to prefectures api.');
        });   
        sleep(1000);

        //市区町村コード取得
        prefectureArray.forEach(function(data) { 
            var xhr = $.ajax({
                        type: 'GET',
                        url: resas_api_citycode_url + '?prefCode=' + data.prefCode,
                        dataType: 'json',
                        scriptCharset: 'utf-8',
                        headers: { 'X-API-KEY': resas_api_key },
                        async: false
            }).done(function(resp) {
                resp.result.forEach(function(data) { cityArray.push(data); });
                console.log("fetching city data :"+ JSON.stringify(resp) );
            }).fail(function() {
                tableau.abortWithError('An error has occured while trying to connect to cities api.');
            });
            sleep(1000);
        });
        
        sleep(1000);


        deferredObj.resolve();
        //市区町村でループ
        deferredObj.promise().then(function() { 
            cityArray.forEach(function(data) { 
                var xhr = $.ajax({
                            type: 'GET',
                            url: resas_api_url + '?prefCode='
                                + data.prefCode + '&cityCode=' + data.cityCode,
                            dataType: 'json',
                            scriptCharset: 'utf-8',
                            headers: { 'X-API-KEY': resas_api_key },
                            async: false
                }).done(function(resp, textStatus) {
                    console.log("fetching data :"+ JSON.stringify(resp) );
                    if (resp.result == null){ return;}
                    resp.result.data.forEach(function(data){
                        tableData.push({
                            "prefCode": resp.result.prefCode,
                            "prefName": resp.result.prefName,
                            "cityCode": resp.result.cityCode,
                            "cityName": resp.result.cityName,
                            "year": data.year,
                            "value": data.value
                        });    
                    })
                }).fail(function() {
                    tableau.abortWithError("An error has occured while trying to connect to foundation api.");
                });
                sleep(1000);
            });
        });
        table.appendRows(tableData);
        doneCallback();         
    };

    tableau.registerConnector(myConnector);
})();
    
$(document).ready(function () {
    $("#submitButton").click(function () {
        var api_key = document.getElementById('app_id_input').value;
        tableau.connectionData = JSON.stringify({ api_key: api_key });
        tableau.connectionName = "RESAS 創業比率";
        tableau.submit();
    });
});
