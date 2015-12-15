/**
 * @class Taco.controller.Channels
 * @author Simeon Kessler
 * The Channels controller
 */

if (Taco && Taco.app) {

    Taco.app.entityLists = [
        {
            "documentListType": "pages@mozu",
            "documentTypes": ["web_page@mozu"],
            "enableActiveDateRanges": true,
            "enablePublishing": true,
            "entityType": "cms",
            "listFQN": "pages@mozu",
            "name": "pages",
            "namespace": "mozu",
            "scopeId": 13591,
            "scopeType": "Site",
            "security": "",
            "supportsActiveDateRanges": true,
            "supportsPublishing": true,
            "uniqueId": "cms-pages@mozu",
            "usages": [],
            "views": [
                {
                    "name": "default", 
                    "usages": ["usage1"],
                    "isVisibleInStorefront": false, 
                    "filter": "",
                    "feilds": [
                        {
                            name: "page_type_definition",
                            target: "properties.page_type_definition"
                        },
                        {
                            name: "hidden",
                            target: "properties.hidden"
                        },
                        {
                            name: "link_title",
                            target: "properties.link_title",
                            isVisibleInStorefront: false,
                            name: "default",
                            usages: ["usage1"]
                        }
                    ]
                }
            ]
        }
        // {
        //     documentListType: "pages@mozu"
        //     documentTypes: ["web_page@mozu"]
        //     enableActiveDateRanges: true
        //     enablePublishing: true
        //     entityType: "cms"
        //     listFQN: "pages@mozu"
        //     name: "pages"
        //     namespace: "mozu"
        //     scopeId: 13595
        //     scopeType: "Site"
        //     security: ""
        //     supportsActiveDateRanges: true
        //     supportsPublishing: true
        //     uniqueId: "cms-pages@mozu"
        //     usages: []
        //     views: [{name: "default", usages: ["usage1"], isVisibleInStorefront: false,…}]
        // }
    ];
    
}

Ext.define('Taco.controller.CustomSchema', {
    extend: 'Taco.core.Controller',
    alias: ['Taco.controller.Customschema'],
    requires: [
        'Taco.view.customSchema.Split',
        'Taco.view.error.Http404',
        'Taco.view.customSchema.Edit'
    ],
   
    indexView: 'Taco.view.customSchema.Split',

    documents: function(cfg) {
    	var me = this;
        var config = this.getConfig('cms', arguments);

        if (!config.errorOccurred) {
            me.confirmContext('Taco.view.customSchema.Grid', function () {
                me.ensureRequiredStores(function () {
                    me.createContentView('Taco.view.customSchema.Grid', config);
                });
            }, null, null, { requiresContextOfType: this.getContextFromString(config.scopeType)});
        }

        else {
             me.createContentView('Taco.view.error.Http404');
        }

    },

    entities: function(cfg) {
    	var me = this;
        var config = this.getConfig('mzdb', arguments);
    	
    	if (!config.errorOccurred) {
            me.confirmContext('Taco.view.customSchema.Grid', function () {
                me.ensureRequiredStores(function () {
                    me.createContentView('Taco.view.customSchema.Grid', config);
                });
            }, null, null, { requiresContextOfType: this.getContextFromString(config.scopeType)});
        }

        else {
             me.createContentView('Taco.view.error.Http404');
        }
    
    },

    edit: function(cfg) {
        var me = this;
        
        me.store = Ext.create('Taco.store.Entities', {
            listName: cfg.list,
            entityType: cfg.type,
            autoLoad: false
        });

        me.editors = Taco.core.data.StoreManager.getOrCreate('Taco.store.EntityEditors');

        me.editors.on('load', function(store) {
            me.store.load({
                listName: cfg.list,
                entityType: cfg.type,
                id: cfg.record,
                callback: me.navigateToEdit.bind(me, store)
            });
        }, me)

    },

    navigateToEdit: function(editors, record, store, isSuccessful) {
        var me = this;

        if (isSuccessful) {
            me.confirmContext('Taco.view.customSchema.Edit', function () {
                me.ensureRequiredStores(function () {
                    me.createContentView('Taco.view.customSchema.Edit', {record: record[0], editors: editors});
                });
            });
        }

        else {
             me.createContentView('Taco.view.error.Http404');
        }
    },

    getContextFromString: function(str) {
        return str.toLowerCase().substring(0, 1);
    },

    getConfig: function(type, args) {
        var config = {};
        var argArray = Array.prototype.slice.call(args);
        var documentList = argArray && argArray[0] && typeof argArray[0] === 'string' ? argArray[0] : null;
        var record = argArray && argArray[1] && typeof argArray[1] === 'string' ? argArray[1] : null;
        var listExists = Taco.app.entityLists.filter(function(list) { return list.listFQN === documentList; });

        if (listExists && listExists.length > 0) {
            config.standaloneGrid = true;
            config.listFQN = documentList;
            config.record = record;
            config.entityType = type;
            config.scopeType = listExists[0].scopeType;
            config.listName = listExists[0].name;
            config.views = listExists[0].views;
        }

        else {
            config.errorOccurred = true;
        }

        return config;
    }
   
});