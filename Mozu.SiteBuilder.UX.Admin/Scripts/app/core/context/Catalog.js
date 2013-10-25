Ext.define('Taco.core.context.Catalog', {
    //extend: 'Ext.util.Observable',
    id: -1,
    name: '',
    stagingHost: '',
    defaultHost: '',
    urlToken: null,
    contextType: 'a',

    siteCollection: null,

    constructor: function (config) {
        var me = this;
        config = Ext.apply({}, config);

        Ext.apply(me, config);
        me.callParent([config]);
        me.urlToken = me.contextType + '-' + me.id;
    },

    getSiteId: function () {
        return this.id;
    },

    getCatalogId: function () {
        return this.catalogId;
    },

    getMasterCatalogId: function () {
        return this.masterCatalogId;
    },
  

    getSiteGroupId: function () {
        return this.siteCollection.getSiteGroupId();
    },

    getSiteGroup: function () {
        return this.siteCollection;
    },

    updateContentPublishingMode: function (value) {
        console.log('updateContentPublishingMode for Catalog ID', this.id, ' -> ', value);
    }

});