Ext.define('Taco.core.context.Site', {
    //extend: 'Ext.util.Observable',
    id: -1,
    name:'',
    stagingHost: '',
    defaultHost: '',
    urlToken: null,
    contextType: 's',
    
    masterCatalog: null,
    
    constructor: function (config) {
        var me = this;
        config = Ext.apply({}, config);
       
        Ext.apply(me, config);
        me.callParent([config]);
        me.urlToken = me.contextType +'-'+ me.id;
    },
    
    getSiteId: function () {    
        return this.id;
    },
    
    getCatalogId:function () {
        return this.catalogId;
    },
    
    getCatalog:function () {
        return this.catalog;
    },
    
    getMasterCatalogId: function () {
        return this.masterCatalogId;
    },
    getIsMozuRendered: function () {
        return this.isMozuRendered;
    },
    getSite: function () {
        return this;
    },
    
    getMasterCatalogId: function () {
        return this.masterCatalog.getMasterCatalogId();
    },
    
    getMasterCatalog: function() {
        return this.masterCatalog;
    },
    isPublishingEnabled:function () {
        return this.publishingEnabled;
    },
    formatCurrency: function (value) {
        return Taco.app.context.formatCurrencyFromCode(this.currencyCode, value);
    },
    updateContentPublishingMode: function (value) {
        this.publishingEnabled = value == 'Pending';
        
        Ext.Ajax.request({
            url: '/admin/app/cmspublishing/enablePublishing',
            method: 'POST',
            jsonData : {
                id: this.id,
                publishingEnabled: this.publishingEnabled
            },
            failure : function () {
                console.log(arguments);
            },
            success: function (response) {
                console.log(arguments);
            }
        });
        console.log('updateContentPublishingMode for Site ID', this.id, ' -> ', value);
    }

});