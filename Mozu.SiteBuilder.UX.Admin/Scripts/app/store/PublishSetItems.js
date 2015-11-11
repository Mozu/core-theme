/**
 * @class Taco.store.PublishSets
 */

Ext.define('Taco.store.PublishSetItems', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.PublishSetItem',
    requires: [
        'Taco.model.PublishSetItem'
    ],
    remoteFilter: true,
    pageSize: 25,
    autoLoad: true,
    remoteSort: true,
    //    sorters: {
    //        property: 'name',
    //        direction: 'ASC'
    //    },
    constructor: function (cfg) {
        if (!cfg.code || !cfg.type) {
            Ext.log('bad EntitiesStore Config', { level: 'error' });
        }
        this.callParent(arguments);
    },
    loadPage: function (page, options) {
        options = options || {};
        options.params = options.params || {};
        options.params.code = this.code;
        options.params.type = this.type;

        return this.callParent([page, options]);
    },
    load: function (options) {

        //use initialized values or override if in options...
        
        options = options || {};
        this.code = options.code || this.code;
        this.type = options.type || this.type;
        options.params = options.params || {};
        options.params.code = this.code;
        options.params.type = this.type;

        return this.callParent([options]);
    },
    sync: function(options) {
        options = options || {};
        options.params = options.params || {};
        options.params.code = this.code;
        options.params.type = this.type;
        
        return this.callParent([options]);
    }
});
