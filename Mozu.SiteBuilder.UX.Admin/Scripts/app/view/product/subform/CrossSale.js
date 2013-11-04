Ext.define('Taco.view.product.subform.CrossSale', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.store.Products'],
    title: 'Cross Sale',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    initComponent: function () {
        this.defaults.width = '100%';
        this.defaults.product = this.product;
        this.defaults.productInCatalogInfo = this.productInCatalogInfo;
        this.defaults.persistChangesToModel = true;


        this.ProductStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.Products');


        this.ProductInput = Ext.create('Taco.core.ux.form.BoxSelect', {
            forceSelection: false,
            fieldLabel: 'Choose Product',
            store: this.ProductStore,
            queryMode: 'local',
            displayField: 'productName',
            valueField: 'productCode'
        });


        this.items = [this.ProductInput];

        this.callParent( arguments );
    }
});