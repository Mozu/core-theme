/**
* @class Taco.controller.Categories
* @author Jason Cochran
* The Category controller
*/
Ext.define('Taco.controller.Categories', {
    extend: 'Taco.core.Controller',
    requires:['Taco.view.category.Edit'],
    editorView: 'Taco.view.category.Edit',
    listView: null,
    models: ['Category'],
    views: ['category.Index'],
    stores: ['Categories'],
    modelName: 'Category',

    createdynamic: function (id, additionalParams, appState) {
        additionalParams.isDynamic = true;
        return this.doCreate(null, additionalParams, appState, this.getEditorView(), Taco.model[this.modelName]);
    },

    doCreateInternal: function (id, additionalParams, appState, viewName, model) {
        var record = appState ? appState.record : Ext.create(model);
        
        // had to dup this method from the base controller class so I can modify the record; not ideal but the way category gets data is very atypical.
        if (additionalParams.isDynamic) {
            record.set("categoryType", "DynamicPreComputed");
        }

        this.ensureRequiredStores(function () {
            this.createContentView(viewName, Ext.apply({
                record: record
            }, additionalParams || {}));
        });
    },

    edit: function (id, additionalParams, appState) {
        
        var record = appState ? appState.record : null, 
            options= appState ? appState.options : null,
            store,
            fnLoadEditor,
            me = this;

        if (record) {
            this.createContentView(this.getEditorView(), {
                record: record,
                options:options
            });
        } else {

            store = Taco.core.data.StoreManager.getOrCreate('Taco.store.Categories');

            fnLoadEditor = function () {
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
        }
    }
});