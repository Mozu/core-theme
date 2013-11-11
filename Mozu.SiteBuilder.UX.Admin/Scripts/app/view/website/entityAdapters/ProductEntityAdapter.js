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

    getPageSettings: function () {
        var me = this;

        return [{
            panelCls: 'Taco.view.website.settings.General',
            getRecord: function () {

                return me.get().getProductInSite();
            }
        }, {
        //     panelCls: 'Taco.view.website.settings.Templates',
        //     getRecord: function () {
        //         return me.get().getProductInSite();
        //     }
        // }, {
            panelCls: 'Taco.view.website.settings.Seo',
            getRecord: function () {
                return me.get().getProductInSite();
            }
        }];
    },

    getStore: function () {
        return Taco.core.data.StoreManager.getOrCreate('Taco.store.Products');
    },

    isHidden: function () {
        return !this.get().get('isActive');
    },

    setHidden: function (hide) {
        this.get().set('isActive', !hide);
    }

});
