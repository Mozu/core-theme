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
    
    getMasterCatalogId: function () {
        return this.masterCatalogId;
    },
    getIsMozuRendered: function () {
        return this.isMozuRendered;
    },

    getMasterCatalogId: function () {
        return this.masterCatalog.getMasterCatalogId();
    },
    
    getMasterCatalog: function() {
        return this.masterCatalog;
    },

    updateContentPublishingMode: function(value) {
        console.log('updateContentPublishingMode for Site ID', this.id, ' -> ', value);
    }

});