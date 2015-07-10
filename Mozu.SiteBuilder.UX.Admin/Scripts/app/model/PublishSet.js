/**
 * @class Taco.model.PublishSet
 */

Ext.define('Taco.model.PublishSet', {
    extend: 'Taco.core.data.Model',
    
    // need to set these up
    behaviors: {
        read: 24,
        create: 25,
        update: 26,
        destroy: 27
    },
    
    idProperty: 'code',

    statics: {

        publishAll: function(cfg){
            this.doPublish(Ext.apply({}, {
                url: '/admin/app/publishsets/publishAll',
                jsonData: cfg.data
            }, cfg));
        },

        discardAll: function(cfg) {
            this.doPublish(Ext.apply({}, {
                url: '/admin/app/publishsets/discardAll',
                jsonData: cfg.data
            }, cfg));
        },

        unassignAll: function(cfg) {
            this.doPublish(Ext.apply({}, {
                url: '/admin/app/publishsets/unassignAll',
                jsonData: cfg.data
            }, cfg));
        },

        doPublish: function (cfg) {
            var options = Ext.apply({}, {
                method: 'POST',
                success: function () {
                    if (cfg.success) {
                        cfg.success.apply(cfg.scope || this, arguments);
                    }
                }
            }, cfg);
            Ext.Ajax.request(options);
        }
    },

    fields: [
        {
            name: 'name',
            type: 'string',
            convert: function(name, record) {
                if (record.get('code').toLowerCase() === 'unassigned') return 'unassigned';
                else return name;
            }
        },
        {
            name: 'code',
            type: 'string'
        }, 
        {
            name: 'contentCount',
            type: 'int'
        },
        {
            name: 'productCount',
            type: 'int'
        },
        {
            name: 'publishDate',
            type: 'date',
            defaultValue: 'Unset'
        },
        {
            name: 'notes',
            type: 'string'
        },
        {
            name: 'auditInfo',
            type: 'auto',
            useNull: true
        },
        {
            name: 'lastPublished',
            type: 'date',
            convert: function(value, model) {
                return model.get('auditInfo').updateDate;
            },
            defaultValue: null
        },
        {
            name: 'lastPublishedBy',
            type: 'date',
            convert: function(value, model) {
                return model.get('auditInfo').updateBy;
            },
            defaultValue: null
        },
        {
            name: 'createBy',
            type: 'string',
            convert: function(value, model) {
                return model.get('auditInfo').createBy;
            },
            defaultValue: null
        },
         {
            name: 'createDate',
            type: 'date',
            convert: function(value, model) {
                return model.get('auditInfo').createDate;
            },
            defaultValue: null
        },
        {
            name: 'updateBy',
            type: 'string',
            convert: function(value, model) {
                return model.get('auditInfo').updateBy;
            },
            defaultValue: null
        },
        {
            name: 'updateDate',
            type: 'date',
            convert: function(value, model) {
                return model.get('auditInfo').updateDate;
            },
            defaultValue: null
        }
    ],

    getAuditInfoValue: function(model, key) {
        return model && model.get('auditInfo') ? model.get('auditInfo')[key] : ' ';
    },

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/publishsets/list',
            create: '/admin/app/publishsets/create',
            update: '/admin/app/publishsets/update',
            destroy: '/admin/app/publishsets/delete'
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
});