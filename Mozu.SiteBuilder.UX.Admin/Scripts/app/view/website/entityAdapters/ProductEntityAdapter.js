/**
 * @class Taco.view.website.entityAdapters.ProductEntityAdapter
 */

Ext.define('Taco.view.website.entityAdapters.ProductEntityAdapter', {
    extend: 'Taco.view.website.entityAdapters.BaseEntityAdapter',

    modelName: 'Taco.model.Product',

 	allowedActions: {
        copy: false,
        preview: true,
        destroy: false
    },

    doFormView: function () {
        Taco.core.StateManager.attemptNavigate('products/edit/' + this.get().getId());
    },

    getId: function () {
        return this.pageContext.productCode;
    },

    

    getStore: function () {
        return Taco.core.data.StoreManager.getOrCreate('Taco.store.Products');
    },

    isHidden: function () {
        return !this.get().get('isActive');
    },

    setHidden: function (hide) {
        this.get().set('isActive', !hide);
    },
    addSaveTasks: function (tasks) {
        var record = this.get();
        tasks.add({
            saveRecord: record,
            dependencyFilter: function (item) {
                return item.updateRecord && (item.updateRecord.modelName == 'Taco.model.ProductInCatalogInfo' || item.updateRecord.modelName == 'Taco.model.Product');
            }
        });
        this.callParent(arguments);
    },
    getPageSettings: function () {
        var me = this;

        return [
            
            //Ext.create('Taco.view.website.settings.CategoryDocument', {
            //    record: me.getCmsPageDoc()
            //}),
            Ext.create('Taco.view.website.settings.CatalogSeo', {
                record: me.get().getProductInCatalog()
            })
        ];
    }

});
