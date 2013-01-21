/**
 * @class Taco.controller.Products
 * @author Jason Cochran
 * The Products controller
 */

Ext.define('Taco.controller.Products', {
    extend: 'Taco.core.Controller',
    requires:['Taco.view.product.Edit-DEPRECATED'],
    editorView: 'Taco.view.category.SimpleEditor',
    listView: null,
    models: ['Taco.model.Product'],
    stores: ['Taco.store.Products'],
    views: ['product.Index'],
    modelName: 'Taco.model.Product',


    index: function () {
        this.createContentView('Taco.view.product.Index');
    },

    create: function (args) {
        var me = this;

        var data = Ext.create('Taco.model.Product', {
            id: 0
        });
        me.getTacoStoreProductsStore().insert(0, [data]);
        me.createContentView('Taco.view.product.Edit-DEPRECATED', {
            data: data,
            store: me.getTacoStoreProductsStore()
        });

    },

    edit: function (params) {
            var me=this,id = params.id || params;
            
            Taco.model.Product.load(id, {
                success: function (record, o) {
                    me.createContentView('Taco.view.product.Index', { editRecordId: record });
                }
            });
        }
});