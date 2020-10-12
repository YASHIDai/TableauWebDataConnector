(function () {
    var myConnector = tableau.makeConnector();

    var url="https://u10sme-api.smrj.go.jp/v1/corporations.json?limit=100&offset="
    
    //スキーマ定義
    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id : "id", alias : "企業情報ID", dataType : tableau.dataTypeEnum.string },
            { id : "corporateNumber", alias : "法人番号", dataType : tableau.dataTypeEnum.string },
            { id : "uqOperatorCode", alias : "業者コード(統一資格審査)", dataType : tableau.dataTypeEnum.string },
            { id : "name", alias : "事業者名", dataType : tableau.dataTypeEnum.string },
            { id : "nameKana", alias : "事業者名フリガナ", dataType : tableau.dataTypeEnum.string },
            { id : "postalCode", alias : "郵便番号", dataType : tableau.dataTypeEnum.string },
            { id : "prefectureCode", alias : "都道府県コード (2桁)", dataType : tableau.dataTypeEnum.string },
            { id : "cityCode", alias : "市町村コード (2桁)", dataType : tableau.dataTypeEnum.string },
            { id : "address", alias : "住所", dataType : tableau.dataTypeEnum.string }, 
            { id : "phoneNumber", alias : "電話番号", dataType : tableau.dataTypeEnum.string },
            { id : "faxNumber", alias : "FAX番号", dataType : tableau.dataTypeEnum.string },
            { id : "email", alias : "Eメールアドレス", dataType : tableau.dataTypeEnum.string },
            { id : "departmentName", alias : "部署名", dataType : tableau.dataTypeEnum.string },
            { id : "businessAreasRegion", alias : "営業エリア地方", dataType : tableau.dataTypeEnum.string },
            { id : "businessAreasPrefectures", alias : "営業エリア都道府県", dataType : tableau.dataTypeEnum.string },
            { id : "serviceCategories", alias : "営業品目（区分）", dataType : tableau.dataTypeEnum.string },
            { id : "serviceKinds", alias : "営業品目（種別）", dataType : tableau.dataTypeEnum.string },
            { id : "services", alias : "営業品目（品目）", dataType : tableau.dataTypeEnum.string },
            { id : "tags", alias : "タグデータ", dataType : tableau.dataTypeEnum.string },
            { id : "affiliatedGroup", alias : "所属団体", dataType : tableau.dataTypeEnum.string },
            { id : "qualification", alias : "資格", dataType : tableau.dataTypeEnum.string },
            { id : "businessResults", alias : "受注実績・主要取引先", dataType : tableau.dataTypeEnum.string },
            { id : "profile", alias : "事業内容・商品PR", dataType : tableau.dataTypeEnum.string },
            { id : "url", alias : "URL", dataType : tableau.dataTypeEnum.string },
            { id : "foundationDate", alias : "創業・設立年月日", dataType : tableau.dataTypeEnum.string },
            { id : "capital", alias : "資本金", dataType : tableau.dataTypeEnum.string },
            { id : "numberOfEmployees", alias : "従業員数", dataType : tableau.dataTypeEnum.string },
            { id : "lastUpdateTime", alias : "最終更新日時", dataType : tableau.dataTypeEnum.string }
        ];

        var tableInfo = {
            id : "procurement",
            alias : "ここから調達-企業情報",
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
        deferredObj.promise().then(function() {
            while(offset < 1000){
                console.log('offset:'+offset);
                var xhr = $.ajax({ 
                            url: url + offset,
                            dataType: 'json',
                            type: "GET",
                            async: false
                }).done(function(resp) {

                    resp.corporations.forEach(function(corporation) {
                        tableData.push({
                            "id" : corporation.id,
                            "corporateNumber"  : (corporation.corporateNumber)?corporation.corporateNumber:"",
                            "uqOperatorCode"  : (corporation.uqOperatorCode)?corporation.uqOperatorCode:"",
                            "name"  : (corporation.name && corporation.name)?corporation.name:"",
                            "nameKana"  : (corporation.nameKana)?corporation.nameKana:"",
                            "postalCode"  : (corporation.location && corporation.location.postalCode) ? corporation.location.postalCode :"",
                            "prefectureCode"  : (corporation.location && corporation.location.prefectureCode) ? corporation.location.prefectureCode :"",
                            "cityCode"  : (corporation.location && corporation.location.cityCode) ? corporation.location.cityCode :"",
                            "address"  : (corporation.location && corporation.location.address) ? corporation.location.address :"",
                            "phoneNumber"  : (corporation.contact && corporation.contact.phoneNumber) ? corporation.contact.phoneNumber :"",
                            "faxNumber"  : (corporation.contact && corporation.contact.faxNumber) ? corporation.contact.faxNumber :"",
                            "email"  : (corporation.contact && corporation.contact.email) ? corporation.contact.email :"",
                            "departmentName"  :  (corporation.contact && corporation.contact.departmentName) ? corporation.contact.departmentName :"",
                            "businessAreasRegion"  : (corporation.businessAreas)?corporation.businessAreas.map(function(obj){return obj.name;}).join(','):"",
                            "businessAreasPrefectures"  : (corporation.businessAreas)?corporation.businessAreas.map(function(area){return area.prefectures.map(function(pref){return pref.name;}).join(',')}).join(','):"",
                            "serviceCategories"  : (corporation.serviceCategories)?corporation.serviceCategories.map(function(serviceCategory){return serviceCategory.name;}).join(','):"",
                            "serviceKinds"  : (corporation.serviceCategories)?corporation.serviceCategories.map(function(serviceCategory){return serviceCategory.serviceKinds.map(function(serviceKind){return serviceKind.name;}).join(',');}).join(','):"",
                            "services"  : (corporation.serviceCategories)?corporation.serviceCategories.map(function(serviceCategory){return serviceCategory.serviceKinds.map(function(serviceKind){return serviceKind.services.map(function(service){return service.name;}).join(',');}).join(',');}).join(','):"",
                            "tags"  : (corporation.tags)?corporation.tags.join(','):"",
                            "affiliatedGroup"  : (corporation.affiliatedGroup)?corporation.affiliatedGroup:"",
                            "qualification"  : (corporation.qualification)?corporation.qualification:"",
                            "businessResults"  : (corporation.businessResults)?corporation.businessResults:"",
                            "profile"  : (corporation.profile)?corporation.profile:"",
                            "url"  : (corporation.url)?corporation.url:"",
                            "foundationDate"  : (corporation.foundationDate)?corporation.foundationDate:"",
                            "capital"  : (corporation.capital)?corporation.capital:"",
                            "numberOfEmployees"  : (corporation.numberOfEmployees)?corporation.numberOfEmployees:"",
                            "lastUpdateTime"  : (corporation.lastUpdateTime)?corporation.lastUpdateTime:""
                        });
                    }) 
                    offset=offset+100;
                }).fail(function() {
                    tableau.abortWithError("An error has occured while trying to connect to api.");
                });
                sleep(1000);
            }    
        });
        table.appendRows(tableData);
        doneCallback();
    };

    tableau.registerConnector(myConnector);
    
})();

//イベントリスナーを設定
$(document).ready(function () {
    $("#submitButton").click(function () {
        tableau.connectionName = "ここから調達企業情報";
        tableau.submit();
    });
});