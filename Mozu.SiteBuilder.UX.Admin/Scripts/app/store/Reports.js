/**
 * @class Taco.store.Roles
 */


Ext.define('Taco.store.Reports', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.ReportList',

    storeManagerConfig: {
        createOnly: true,
        autoLoad: true
    },
    constructor: function (cfg) {
        this.callParent(arguments);
    },
    loadPage: function (page, options) {
        options = options || {};
        options.params = options.params || {};

        return this.callParent([page, options]);
    },
    load: function (options) {
        options = options || {};
        options.params = options.params || {};

       

        return this.callParent([options]);
    }
}
);
