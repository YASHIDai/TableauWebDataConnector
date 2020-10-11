(function () {
    var myConnector = tableau.makeConnector();

    var url="https://jirei-seido-api.mirasapo-plus.go.jp/supports?sort=update&order=desc&limit=100&offset="
    
    //スキーマ定義
    myConnector.getSchema = function (schemaCallback) {
        var cols = [
            { id : "id", alias : "管理ID", dataType : tableau.dataTypeEnum.string },
            { id : "mngGroup", alias : "管理グループID", dataType : tableau.dataTypeEnum.string },
            { id : "catalog_name", alias : "カタログ名", dataType : tableau.dataTypeEnum.string },
            { id : "specialMeasure", alias : "特定施策区分", dataType : tableau.dataTypeEnum.string },
            { id : "published", alias : "公開状態", dataType : tableau.dataTypeEnum.bool },
            { id : "deleted", alias : "削除状態", dataType : tableau.dataTypeEnum.bool },
            { id : "publishDate", alias : "公開日", dataType : tableau.dataTypeEnum.date },
            { id : "unpublishDate", alias : "公開終了日", dataType : tableau.dataTypeEnum.date },
            { id : "priority", alias : "表示優先度", dataType : tableau.dataTypeEnum.bool }, 
            { id : "language", alias : "言語", dataType : tableau.dataTypeEnum.string },
            { id : "updateInfo_createdBy_id", alias : "作成者ID", dataType : tableau.dataTypeEnum.string },
            { id : "updateInfo_createdBy_name", alias : "作成者", dataType : tableau.dataTypeEnum.string },
            { id : "updateInfo_createdAt", alias : "作成日", dataType : tableau.dataTypeEnum.datetime },
            { id : "updateInfo_lastModifiedBy_id", alias : "更新者ID", dataType : tableau.dataTypeEnum.string },
            { id : "updateInfo_lastModifiedBy_name", alias : "更新者", dataType : tableau.dataTypeEnum.string },
            { id : "updateInfo_lastModifiedAt", alias : "更新日", dataType : tableau.dataTypeEnum.datetime },
            { id : "hasCaseStudies", alias : "事例有無", dataType : tableau.dataTypeEnum.bool },
            { id : "title", alias : "タイトル", dataType : tableau.dataTypeEnum.string },
            { id : "subTitle", alias : "サブタイトル", dataType : tableau.dataTypeEnum.string },
            { id : "competentAuthoritiesCode", alias : "制度所管組織コード", dataType : tableau.dataTypeEnum.string },
            { id : "competentAuthorities", alias : "制度所管組織", dataType : tableau.dataTypeEnum.string },
            { id : "number", alias : "制度番号", dataType : tableau.dataTypeEnum.string },
            { id : "baseId", alias : "元制度管理ID", dataType : tableau.dataTypeEnum.string },
            { id : "baseNumber", alias : "元制度番号", dataType : tableau.dataTypeEnum.string },
            { id : "baseOverride", alias : "制度変更区分", dataType : tableau.dataTypeEnum.string },
            { id : "target", alias : "対象者", dataType : tableau.dataTypeEnum.string },
            { id : "applicationTarget", alias : "用途・対象物", dataType : tableau.dataTypeEnum.string },
            { id : "prefectures_name", alias : "都道府県名", dataType : tableau.dataTypeEnum.string },
            { id : "area", alias : "対象地域群", dataType : tableau.dataTypeEnum.string },
            { id : "maxEmployeesCount", alias : "従業員条件(人以下)", dataType : tableau.dataTypeEnum.int },
            { id : "maxCapital", alias : "資本金条件(円以下)", dataType : tableau.dataTypeEnum.int },
            { id : "maxEstablishedYears", alias : "創業年条件(年未満)", dataType : tableau.dataTypeEnum.string },
            { id : "summary", alias : "概要", dataType : tableau.dataTypeEnum.string },
            { id : "body", alias : "内容", dataType : tableau.dataTypeEnum.string },
            { id : "usage", alias : "利用・申請方法", dataType : tableau.dataTypeEnum.string },
            { id : "reception_start_date", alias : "受付開始日", dataType : tableau.dataTypeEnum.date },
            { id : "reception_end_date", alias : "受付終了日", dataType : tableau.dataTypeEnum.date },
            { id : "reception_remarks", alias : "受付備考", dataType : tableau.dataTypeEnum.string },
            { id : "applicationUrl", alias : "電子申請URL", dataType : tableau.dataTypeEnum.string },
            { id : "governingLaw", alias : "根拠法令", dataType : tableau.dataTypeEnum.string },            
            { id : "reference", alias : "詳細参照先", dataType : tableau.dataTypeEnum.string },
            { id : "support_organization", alias : "実施組織・支援機関", dataType : tableau.dataTypeEnum.string },
            { id : "inquiry", alias : "お問合せ先", dataType : tableau.dataTypeEnum.string },
            { id : "industry_categories_name", alias : "標準産業分類", dataType : tableau.dataTypeEnum.string },
            { id : "stage_categories_name", alias : "事業ステージ分類", dataType : tableau.dataTypeEnum.string },
            { id : "service_categories_name", alias : "行政サービス分類", dataType : tableau.dataTypeEnum.string },
            { id : "purpose_categories_id", alias : "お困りごと分類ID", dataType : tableau.dataTypeEnum.string },
            { id : "purpose_categories_name", alias : "お困りごと分類", dataType : tableau.dataTypeEnum.string },
            { id : "disasters_name", alias : "災害名", dataType : tableau.dataTypeEnum.string },
            { id : "keywords", alias : "キーワード", dataType : tableau.dataTypeEnum.string },
            { id : "url", alias : "サイトURL", dataType : tableau.dataTypeEnum.string }
        ];

        var tableInfo = {
            id : "seido_navi",
            alias : "ミラサポplus制度ナビ情報",
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
                    console.log(resp);
                    if(resp.total==0){
                        offset = 1000;
                        return;
                    } 
                    resp.items.forEach(function(item) {
                        tableData.push({
                            "id" : item.id,
                            "mngGroup"  : (item.mng_group)?item.mng_group:"",
                            "catalog_name"  : (item.catalogs)?item.catalogs.map(function(obj){return obj.name}).join(','):"",
                            "specialMeasure"  : (item.special_measure && item.special_measure.name)?item.special_measure.name:"",
                            "published"  : (item.published)?item.published:"",
                            "deleted"  : (item.deleted)?item.deleted:"",
                            "publishDate"  : (item.publishDate)?item.publishDate:"",
                            "unpublishDate"  : (item.unpublishDate)?item.unpublishDate:"",
                            "priority"  : (item.priority)?item.priority:"",
                            "language"  : (item.language)?item.language:"",
                            "updateInfo_createdBy_id"  : (item.update_info.created_by && item.update_info.created_by.id) ? item.update_info.created_by.id :"",
                            "updateInfo_createdBy_name"  : (item.update_info.created_by && item.update_info.created_by.name) ? item.update_info.created_by.name :"",
                            "updateInfo_createdAt"  : item.update_info.created_at,
                            "updateInfo_lastModifiedBy_id"  : (item.update_info.last_modified_by && item.update_info.last_modified_by.id) ? item.update_info.last_modified_by.id:"",
                            "updateInfo_lastModifiedBy_name"  : (item.update_info.last_modified_by && item.update_info.last_modified_by.name) ? item.update_info.last_modified_by.name:"",
                            "updateInfo_lastModifiedAt"  : item.update_info.last_modified_at,
                            "hasCaseStudies"  : (item.has_case_studies)?item.has_case_studies:"",
                            "title"  : (item.title)?item.title:"",
                            "subTitle"  : (item.subtitle)?item.subtitle:"",
                            "competentAuthoritiesCode"  : (item.competent_authorities)?item.competent_authorities.map(function(obj){return obj.code}).join(','):"",
                            "competentAuthorities"  : (item.competent_authorities)?item.competent_authorities.map(function(obj){return obj.name}).join(','):"",
                            "number"  : (item.number)?item.number:"",
                            "baseId"  : (item.base_id)?item.base_id:"",
                            "baseNumber"  : (item.base_number)?item.base_number:"",
                            "baseOverride"  : (item.base_override)?item.base_override:"",
                            "target"  : (item.target)?item.target:"",
                            "applicationTarget"  : (item.application_target)?item.application_target:"",
                            "prefectures_name"  : (item.prefectures)?item.prefectures.map(function(obj){return obj.name}).join(','):"",
                            "area"  : (item.area)?item.area:"",
                            "maxEmployeesCount"  : (item.max_employees_count)?item.max_employees_count:"",
                            "maxCapital"  : (item.max_capital)?item.max_capital:"",
                            "maxEstablishedYears"  : (item.max_established_years)?item.max_established_years:"",
                            "summary"  : (item.summary)?item.summary:"",
                            "body"  : (item.body)?item.body:"",
                            "usage"  : (item.usage)?item.usage:"",
                            "reception_start_date"  : (item.reception_start_date)?item.reception_start_date:"",
                            "reception_end_date"  : (item.reception_end_date)?item.reception_end_date:"",
                            "reception_remarks"  : (item.reception_remarks)?item.reception_remarks:"",
                            "applicationUrl"  : (item.application_url)?item.application_url:"",
                            "governingLaw"  : (item.governing_law)?item.governing_law:"",
                            "reference"  : (item.reference)?item.reference:"",
                            "support_organization"  : (item.support_organization)?item.support_organization:"",
                            "inquiry"  : (item.inquiry)?item.inquiry:"",
                            "industry_categories_name"  : (item.industry_categories)?item.industry_categories.map(function(obj){return obj.name}).join(','):"",
                            "stage_categories_name"  : (item.stage_categories)?item.stage_categories.map(function(obj){return obj.name}).join(','):"",
                            "service_categories_name"  : (item.service_categories)?item.service_categories.map(function(obj){return obj.name}).join(','):"",
                            "purpose_categories_id"  : (item.purpose_categories)?item.purpose_categories.map(function(obj){return obj.id}).join(','):"",
                            "purpose_categories_name"  : (item.purpose_categories)?item.purpose_categories.map(function(obj){return obj.name}).join(','):"",
                            "disasters_name"  : (item.disasters)?item.disasters.map(function(obj){return obj.name}).join(','):"",
                            "keywords"  : (item.keywords)?item.keywords.join(','):"",
                            "url" : 'https://seido-navi.mirasapo-plus.go.jp/supports/'+item.id
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
        tableau.connectionName = "ミラサポplus制度ナビ情報";
        tableau.submit();
    });
});