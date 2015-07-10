/**
 * @class Taco.store.PublishSets
 */

Ext.define('Taco.store.PublishSets', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.PublishSet',
    requires: [
        'Taco.model.PublishSet'
    ],
    remoteFilter: true,
    pageSize: 25,
    autoLoad: true,
    remoteSort: true,
    sortInfo: {
        field: 'name',
        direction: 'asc' || 'desc'
    },
    loadPage: function (page, options) {
        options = options || {};
        options.params = options.params || {};
        options.params.includeCounts = this.includeCounts;

        return this.callParent([page, options]);
    },
    load: function (options) {
        options = options || {};
        options.params = options.params || {};
        options.params.includeCounts = this.includeCounts;
        
        return this.callParent([options]);
    }
});
