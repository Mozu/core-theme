Ext.define('Taco.core.context.Catalog', {
    //extend: 'Ext.util.Observable',
    id: -1,
    name: '',
    stagingHost: '',
    defaultHost: '',
    urlToken: null,
    contextType: 'c',

    masterCatalog: null,

    constructor: function (config) {
        var me = this;
        config = Ext.apply({}, config);
        me.sites = [];
        Ext.apply(me, config);
        me.callParent([config]);
        me.urlToken = me.contextType + '-' + me.id;
    },

    getSiteId: function () {
        return null;
    },

    getCatalogId: function () {
        return this.id;
    },

    getCatalog: function () {
        return this;
    },
    getSite: function () {
        return null;
    },

    getSites: function () {
        return this.sites;
    },

    getMasterCatalogId: function () {
        return this.masterCatalog.getMasterCatalogId();
    },

    getMasterCatalog: function () {
        return this.masterCatalog;
    },

    updateContentPublishingMode: function (value) {
        console.log('updateContentPublishingMode for Catalog ID', this.id, ' -> ', value);
    },

    formatCurrency: function (value) {
        return Taco.app.context.formatCurrencyFromCode(this.currencyCode, value);
    },
    isContentPublishingEnabled: function () {
        return this.contentPublishingEnabled;
    },
    updateContentPublishingMode: function (value) {
        this.publishingEnabled = value == 'Pending';

        Ext.Ajax.request({
            url: '/admin/app/cmspublishing/enablePublishing',
            method: 'POST',
            jsonData: {
                context: {
                    catalogId: this.id,
                },
                publishingEnabled: this.publishingEnabled

            }
        });
        console.log('updateContentPublishingMode for Site ID', this.id, ' -> ', value);
    }
});