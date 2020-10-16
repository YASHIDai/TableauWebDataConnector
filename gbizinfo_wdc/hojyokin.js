(function () {
    var myConnector = tableau.makeConnector();
    
    var gbizinfo_api_url = "https://script.google.com/macros/s/AKfycbxb2cxiOtgFRhTCSBVo_7vxTQoXX6gVv2PqqdU54XSQ1N8C_a3x/exec?url=https://api.info.gbiz.go.jp/sparql?query=PREFIX++hj%3A+%3Chttp%3A%2F%2Fhojin-info.go.jp%2Fns%2Fdomain%2Fbiz%2F1%23%3E%0D%0APREFIX++ic%3A+%3Chttp%3A%2F%2Fimi.go.jp%2Fns%2Fcore%2Frdf%23%3E%0D%0ASELECT+%3FcorporateID+%3FcertificationDate+%3FactivityName+%3Fsubsidy+%3FcertifiedObject+%3FpuborgName+%3Fremmei+%0D%0A+FROM+%3Chttp%3A%2F%2Fhojin-info.go.jp%2Fgraph%2Fhojyokin%3E+%7B+%0D%0A+++++%3Fs+hj%3A%E6%B3%95%E4%BA%BA%E6%B4%BB%E5%8B%95%E6%83%85%E5%A0%B1+%3Fkey.+%0D%0A+++++%3Fkey+ic%3AID%2Fic%3A%E8%AD%98%E5%88%A5%E5%80%A4+%3FcorporateID+.+%0D%0A+++++OPTIONAL%7B%3Fkey+hj%3A%E8%AA%8D%E5%AE%9A%E6%97%A5%2Fic%3A%E6%A8%99%E6%BA%96%E5%9E%8B%E6%97%A5%E4%BB%98+%3FcertificationDate+.%7D+%0D%0A+++++OPTIONAL%7B%3Fkey+hj%3A%E6%B4%BB%E5%8B%95%E5%90%8D%E7%A7%B0%2Fic%3A%E8%A1%A8%E8%A8%98+%3FactivityName+.%7D+%0D%0A+++++OPTIONAL%7B%3Fkey+ic%3A%E9%87%91%E9%A1%8D%2Fic%3A%E6%95%B0%E5%80%A4+%3Fsubsidy+.%7D+%0D%0A+++++OPTIONAL%7B%3Fkey+hj%3A%E5%AF%BE%E8%B1%A1+%3FcertifiedObject+.%7D+%0D%0A+++++OPTIONAL%7B%3Fkey+hj%3A%E5%85%AC%E8%A1%A8%E7%B5%84%E7%B9%94%2Fic%3A%E5%90%8D%E7%A7%B0%2Fic%3A%E8%A1%A8%E8%A8%98+%3FpuborgName+.%7D+%0D%0A+++++OPTIONAL%7B%3Fkey+hj%3A%E5%82%99%E8%80%83%2Fic%3A%E7%A8%AE%E5%88%A5+%3Fremmei+.%7D+%0D%0A+%7D";
    
    //スキーマ定義
    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id : "corporateID", alias : "法人番号", dataType : tableau.dataTypeEnum.string },
            { id : "certificationDate", alias : "認定日", dataType : tableau.dataTypeEnum.date },
            { id : "activityName", alias : "活動名称", dataType : tableau.dataTypeEnum.string },
            { id : "subsidy", alias : "金額", dataType : tableau.dataTypeEnum.string },
            { id : "certifiedObject", alias : "対象", dataType : tableau.dataTypeEnum.string },
            { id : "puborgName", alias : "公表組織", dataType : tableau.dataTypeEnum.string },
            { id : "remmei", alias : "備考", dataType : tableau.dataTypeEnum.datetime }
        ];

        var tableInfo = {
            id : "hojyokin",
            alias : "法人活動情報（補助金）",
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
        var offset = 0;

        deferredObj.resolve();
        //ループ
        deferredObj.promise().then(function() { 
            while(offset < 500){
                console.log('offset:'+offset);
                var xhr = $.ajax({
                            type: 'GET',
                            url: gbizinfo_api_url + '+OFFSET+' + offset + '+LIMIT+100',
                            dataType: 'json',
                            async: false
                }).done(function(resp, textStatus) {
                    console.log('resp:'+JSON.stringify(resp));
                    if (resp.results.bindings.length == 0){
                         offset = 500000
                         return;
                    }
                    resp.results.bindings.forEach(function(data){
                        tableData.push({
                            "corporateID": data.corporateID.value,
                            "certificationDate": (data.certificationDate)?data.certificationDate.value:"",
                            "activityName": (data.activityName)?data.activityName.value:"",
                            "subsidy": (data.subsidy)?data.subsidy.value:"",
                            "certifiedObject": (data.certifiedObject)?data.certifiedObject.value:"",
                            "puborgName": (data.puborgName)?data.puborgName.value:"",
                            "remmei": (data.remmei)?data.remmei.value:"",
                        });    
                    })
                    offset=offset+100;
                }).fail(function() {
                    tableau.abortWithError("An error has occured while trying to connect to api.");
                    offset = 500000
                });
                sleep(1000);
            }
        });
        table.appendRows(tableData);
        doneCallback();         
    };

    tableau.registerConnector(myConnector);
})();
    
$(document).ready(function () {
    $("#submitButton").click(function () {
        tableau.connectionName = "Gビズインフォ 法人活動情報（補助金）";
        tableau.submit();
    });
});
