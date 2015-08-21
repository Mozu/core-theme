/**
 * @class Taco.model.PublishSet
 */

Ext.define('Taco.model.PublishSetItem', {
    extend: 'Taco.core.data.Model',
    
    // need to set these up
    behaviors: {
        read: 24,
        create: 25,
        update: 26,
        destroy: 27
    },

    statics: {

        publishCatalogBulk: function (cfg) {
            this.doPublish(Ext.apply({}, {
                url: '/admin/app/catalogpublishing/publish',
                jsonData: cfg.data
            }, cfg));
        },

        discardCatalogBulk: function (cfg) {
            this.doPublish(Ext.apply({}, {
                url: '/admin/app/catalogpublishing/discard',
                jsonData: cfg.data
            }, cfg));
        },

        // publishCatalogAll: function (cfg) {
        //     this.doPublish(Ext.apply({}, {
        //         url: '/admin/app/catalogpublishing/publishall'
        //     }, cfg));
        // },

        // discardCatalogAll: function (cfg) {
        //     this.doPublish(Ext.apply({}, {
        //         url: '/admin/app/catalogpublishing/discardall'
        //     }, cfg));
        // },

        publishCMSBulk: function (cfg) {
            this.doPublish(Ext.apply({}, {
                url: '/admin/app/cmspublishing/pubsetpublish',
                jsonData: cfg.data
            }, cfg));
        },

        discardCMSBulk: function (cfg) {
            this.doPublish(Ext.apply({}, {
                url: '/admin/app/cmspublishing/pubsetdiscard',
                jsonData: cfg.data
            }, cfg));
        },

        // publishCMSAll: function (cfg) {
        //     this.doPublish(Ext.apply({}, {
        //         url: '/admin/app/cmspublishing/publishall'
        //     }, cfg));
        // },

        // discardCMSAll: function (cfg) {
        //     this.doPublish(Ext.apply({}, {
        //         url: '/admin/app/cmspublishing/discardall'
        //     }, cfg));
        // },


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
    
    idProperty: 'code',

    fields: [
        {
            name: 'id',
            type: 'string'
        }, 
        {
            name: 'name',
            type: 'string'
        },
        {
            name: 'listFQN',
            type: 'string'
        },
        {
            name: 'draftUpdateDate',
            type: 'date',
            dateFormat: 'c'
        },
        {
            name: 'publishDate',
            type: 'date',
            dateFormat: 'c'
        },
        {
            name: 'lastPublishDate',
            type: 'date',
            dateFormat: 'c'
        },
        {
            name: 'updatedBy',
            type: 'string',
            dateFormat: 'c'
        },
        {
            name: 'type',
            type: 'string'
        },
        {
            name: 'publishType',
            type: 'string'
        },
        {
            name: 'masterCatalogId',
            type: 'int',
            defaultValue: null
        },
        {
            name: 'activeUpdateDate',
            type: 'date',
            dateFormat: 'c'
        },
        {
            name: 'catalogId',
            type: 'int',
            defaultValue: null
        },
        {
            name: 'siteId',
            type: 'int',
            defaultValue: null
        },
        {
            name: 'publishSetCode',
            type: 'string'
        },
        {
            name: 'publishSetName',
            type: 'string',
            defaultValue: null
        }

    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/publishsets/items/list',
            create: '/admin/app/publishsets/items/create',
            update: '/admin/app/publishsets/items/create',
            destroy: '/admin/app/publishsets/items/delete'
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