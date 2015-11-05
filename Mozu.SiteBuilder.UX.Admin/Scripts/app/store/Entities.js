/**
 * @class Taco.store.Entities
 */


Ext.define('Taco.store.Entities', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Entity',
        remoteFilter: true,
        constructor: function (cfg) {
            if (!cfg.listName || !cfg.entityType) {
                Ext.log('bad EntitiesStore Config', { level: 'error' });
            }
            this.callParent(arguments);
        },
        loadPage: function (page, options) {

            options = options || {};
            options.params = options.params || {};
            options.params.list = this.listName;
            options.params.entityType = this.entityType;
            options.params.view = this.view;

            return this.callParent([page, options]);
        },
        load: function (options) {
            options = options || {};
            options.params = options.params || {};
            options.params.list = this.listName;
            options.params.entityType = this.entityType;
            options.params.view = this.view;

            return this.callParent([options]);
        },
        proxy: {
            type: 'ajax',
            api: {
                read: '/admin/app/entities/read',
                create: '/admin/app/entities/create',
                update: '/admin/app/entities/update',
                destroy: '/admin/app/entities/delete'
            },
            reader: {
                type: 'json',
                root: 'items',
                successProperty: 'success',
                messageProperty: 'message'
            },
            writer: {
                allowSingle: false,
                type: 'json'
            }
        }
    }
);
