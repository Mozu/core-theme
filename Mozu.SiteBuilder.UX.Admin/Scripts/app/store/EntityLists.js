/**
 * @class Taco.store.Roles
 */


Ext.define('Taco.store.EntityLists', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.EntityList',
 
        storeManagerConfig: {
            createOnly:true,
            autoLoad: true
        },
        constructor: function (cfg) {
            if (!cfg.entityType) {
                Ext.log('bad EntitiesStore Config', { level: 'error' });
            }
            this.callParent(arguments);
        },
        loadPage: function (page, options) {

            options = options || {};
            options.params = options.params || {};
        
            options.params.entityType = this.entityType;
            options.params.view = this.view;

            return this.callParent([page, options]);
        },
        load: function (options) {
            options = options || {};
            options.params = options.params || {};
  
            options.params.entityType = this.entityType;
            options.params.view = this.view;

            return this.callParent([options]);
        }
    }
);
