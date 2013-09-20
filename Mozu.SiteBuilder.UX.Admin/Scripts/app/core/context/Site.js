Ext.define('Taco.core.context.Site', {
    //extend: 'Ext.util.Observable',
    id: -1,
    name:'',
    stagingHost: '',
    defaultHost: '',
    urlToken: null,
    contextType: 's',
    
    siteCollection: null,
    
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
    
    getSiteGroupId: function () {
        return this.siteCollection.getSiteGroupId();
    },
    
    getSiteGroup: function() {
        return this.siteCollection;
    },

    updateContentPublishingMode: function(value) {
        console.log('updateContentPublishingMode for Site ID', this.id, ' -> ', value);
    }

});