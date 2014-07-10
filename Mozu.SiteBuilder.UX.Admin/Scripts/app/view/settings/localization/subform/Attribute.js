///**
// * @class Taco.view.settings.localization.subform.Attribute 
// *
// */

//Ext.define('Taco.view.settings.localization.subform.Attribute', {
//    extend: 'Taco.core.ux.form.Form',
//    requires: [
//        'Taco.view.settings.localization.widget.AttributeGrid'
//    ],
//    itemId: 'localizedAttributesSubForm',
//    title: 'Attributes',
//    margin: '20 0',
//    initComponent: function () {
//        var me = this;

//        this.defaults = {
//            width: 200,
//            product: this.product,
//            productInCatalogInfo: this.productInCatalogInfo,
//            labelAlign: 'top',
//            labelSeparator: '',
//            persistChangesToModel: true
//        };

//        this.record = this.product;

//        this.attributeGrid = Ext.create('Taco.view.settings.localization.widget.AttributeGrid', {
//            product : me.product
//        });

        
        
//        this.items = [
//            this.attributeGrid
//        ];

//        this.callParent(arguments);

//        me.mon(me.attributeGrid.store, 'datachanged', me.onStoreDataChanged, me);
        
//    },
    
//    onStoreDataChanged: function (bundleStore) {
//        var me = this,
//            productForm = me.up("productform");
        
//        // when the contents of the bundle store chanes, we need to notifiy the other subForms of the changes so that they can react. Specifically, the shipping and price area will update;
//        //todo change this to fire on the record instead of the productForm
//        if (productForm) {
//            productForm.fireEvent('bundleItemChange');
//        }
//    },

//    // Called before the updateTask of Taco.core.ux.form.Form is executed; Return false to cancel the save; Can be used to manipulate the record data prior to saving;
//    beforeSave: function () {
//        /*
//        var me = this;
//        // need to serialize the store into jsons for persistance
//        var store = this.productBundleGrid.store;
//        var data = [];
//        store.each(function(record) {
//            data.push(Ext.clone(record.data));
//        });
        
//        this.product.set('bundledProducts', data);
//        */
//        return true;
//    }
//});