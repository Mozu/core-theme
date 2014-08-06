Ext.define('Taco.core.context.Site', {
    //extend: 'Ext.util.Observable',
    id: -1,
    name: '',
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
        me.urlToken = me.contextType + '-' + me.id;
    },

    getSiteId: function () {
        return this.id;
    },

    getCatalogId: function () {
        return this.catalogId;
    },

    getCatalog: function () {
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

    getMasterCatalog: function () {
        return this.masterCatalog;
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
                    siteId: this.id,
                    catalogId: this.getCatalogId(),
                    masterCatalogId: this.getMasterCatalogId()
                },
                publishingEnabled: this.publishingEnabled
            }
        });
    }

});