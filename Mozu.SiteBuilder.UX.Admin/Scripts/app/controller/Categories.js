/**
* @class Taco.controller.Categories
* @author Jason Cochran
* The Categories controller
*/
Ext.define('Taco.controller.Categories', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.category.Edit'],
    editorView: 'Taco.view.category.Edit',
    listView: null,
    models: ['Taco.model.Category'],
    stores: ['Taco.store.Categories'],
    views: ['category.Index'],
    modelName: 'Category',

    createdynamic: function(id, additionalParams, appState) {
        additionalParams.isDynamic = true;
        return this.doCreate(null, additionalParams, appState, this.getEditorView(), Taco.model[this.modelName]);
    },

    doCreateInternal: function(id, additionalParams, appState, viewName, model) {
        var record = appState ? appState.record : Ext.create(model);

        // had to dup this method from the base controller class so I can modify the record; not ideal but the way category gets data is very atypical.
        if (additionalParams.isDynamic) {
            record.set("categoryType", "DynamicPreComputed");
        }

        this.ensureRequiredStores(function() {
            this.createContentView(viewName, Ext.apply({
                record: record
            }, additionalParams || {}));
        });
    },

    edit: function(id, additionalParams, appState) {
        var record = appState ? appState.record : null,
            options = appState ? appState.options : null,
            store,
            fnLoadEditor,
            me = this;

        store = Taco.core.data.StoreManager.getOrCreate(
        {
            type: 'Taco.store.Categories',
            createOnly: true,
            id: "cat-" + this.id, //TODO:  play with this to try and reuse the same proxy (eg catCombo)
            autoLoad: false,
            clearFilters: false,
            remoteFilter: false,
            bypassCache: true,
            listeners: {
                beforeload: function(store, operation) {
                    var proxy = store.getProxy();
                    proxy.extraParams = proxy.extraParams || {};
                    if (Number(id) > 0) {
                        proxy.extraParams.id = id;
                    }
                },
                scope: this
            }
        });
        
        if (Number(id) > 0) {
            store.needsRefresh = true;
            store.load({ id: id });
            var proxy = store.getProxy();
            if (proxy.extraParams) {
                delete proxy.extraParams.id;
            }
        }

        fnLoadEditor = function() {
            record = store.getById(parseInt(id, 10));
            me.createContentView(me.getEditorView(), {
                record: record,
                options: options
            });
        };

        if (store.isLoading()) {
            store.on({
                load: fnLoadEditor,
                single: true
            });
        } else {
            fnLoadEditor();
        }
    },
    doDuplicateModelInternal: function (id, additionalParams, appState, viewName, model) {
        var record = appState ? appState.record : null,
            options = appState ? appState.options : null;
        if (appState && appState.container) {
            options = options || {};
            options.container = appState.container;
        }

        if (record) {
            
            record.raw = undefined;

            // do any class specific modifications to the source model that is being cloned
            if (record.beforeDuplicate) {
                record.beforeDuplicate();
            }

            record.phantom = true;
            Ext.data.Model.id(record);
            this.ensureRequiredStores(function () {
                this.createContentView(viewName, {
                    isDuplicate:true,
                    record: record,
                    options: options
                });
            });


        } else {
            Taco.app.setLoading();
            model.load(id, {
                success: function (record) {
                    Taco.app.setLoading(false);

                    record.raw = undefined;

                    // do any class specific modifications to the source model that is being cloned
                    if (record.beforeDuplicate) {
                        record.beforeDuplicate();
                    }

                    record.phantom = true;
                    Ext.data.Model.id(record);

                    this.ensureRequiredStores(function () {
                        this.createContentView(viewName, {
                            isDuplicate: true,
                            record: record,
                            options: options
                        });
                    });
                },
                failure: function () {
                    Taco.app.setLoading(false);
                },
                scope: this
            });
        }
    }
});