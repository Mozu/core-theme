/**
 * @class Taco.store.PriceListEntries
 */

Ext.define('Taco.store.PriceListEntries', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.PriceListEntry',
    requires: [
        'Taco.model.PriceListEntry'
    ],
    remoteFilter: true,
    pageSize: 25,
    autoLoad: false,
    remoteSort: true,
    sortInfo: {
        field: 'name',
        direction: 'asc' || 'desc'
    },
    priceListCode: null,
    loadPage: function (page, options) {
        options = options || {};
        options.params = options.params || {};
        options.params.includeCounts = this.includeCounts;

        return this.callParent([page, options]);
    },
    load: function (options) {
        options = options || {};
        options.params = options.params || {};
        options.params.priceListCode = options.params.priceListCode || this.priceListCode;

        return this.callParent([options]);
    }
});
