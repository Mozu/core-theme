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

        this.ProductInput = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'crossSale',
            forceSelection: false,
            fieldLabel: 'Choose Product',
            store: this.ProductStore,
            value: this.product.get('crossSale'),
            queryMode: 'local',
            displayField: 'productName',
            valueField: 'productCode'
        });


        this.items = [this.ProductInput];

        this.callParent( arguments );
    },

    beforeSave: function () {
        var me = this;
        // do any form validation. return false if the form is not valid for save;

        // do any manual record updates from the form;
        var form = me.getForm();
        // this data member wants the record data instead of the array of values that is return by combo. need to translate to record.data objects
        var locationTypes = form.findField("crossSale");
        me.product.set('crossSale', locationTypes.getValueRecordsData());

        // need to manually mark dirty since the setValue with complex data doesn't trigger the dirty state on the model
        me.product.setDirty();

        return true;
    }
});