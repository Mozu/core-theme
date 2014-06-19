/**
 * @class Taco.store.Roles
 */


Ext.define('Taco.store.Entities', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Entity',
        loadPage: function (page, options) {

            options = options || {};
            options.params = options.params || {};
            options.params.list = this.listName;
            options.params.entityType = this.entityType;

            return this.callParent([page, options]);
        },
        load: function (options) {
            options = options || {};
            options.params = options.params || {};
            options.params.list = this.listName;
            options.params.entityType = this.entityType;

            return this.callParent([options]);
        }
    }
);
