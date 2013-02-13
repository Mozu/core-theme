
/**
* @class Taco.controller.FileManagement
* @author nurf blurfered
* The FileManagement controller
*/

Ext.define('Taco.controller.FileManagement', {
    extend: 'Taco.core.Controller',
    editorView: null,
    listView: null,
    filesStore:null,
    requires: ['Taco.view.fileManagement.Index'],
   // models: ['Taco.model.Product'],
    //stores: ['Taco.store.Products'],
    //views: ['product.Index'],
    //modelName: 'Taco.model.Product',


    index: function () {
        if (Taco.app.context.getCurrent().contextType == 't') {
            this.createContentView('Taco.core.ux.content.Container', {
                header: {
                    title: "choose a site collection"
                },

                body: {
                    layout: 'auto',
                    items: [{
                        html: 'placeholder for choose site collection interstitial '
                    }]
                }
            });
        } else {
            this.createContentView('Taco.view.fileManagement.Index');
        }
    }
    ,
    getFilesStore:function(conf){
        conf = config || {};
        if (this.filesStore == null) {
            this.filesStore = Ext.create('Taco.store.FileManagementFiles');
        }
        if (conf.clearFilters) {
            this.filesStore.clearFilters(true);
        }
    }
   
});