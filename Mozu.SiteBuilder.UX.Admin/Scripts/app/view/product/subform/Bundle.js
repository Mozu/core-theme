/**
 * @class Taco.view.product.subform.Bundle 
 *
 */

Ext.define('Taco.view.product.subform.Bundle', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [
        'Taco.view.product.widget.ProductBundleGrid'
    ],
    itemId: 'bundleSubForm',
    title: 'Bundle Items',
    margin: '20 0',    
    initComponent: function () {
        var me = this,
            readOnly,
            requiredContent,
            visable;

        me.tools = [{
            xtype: 'button',
            ui: "action-primary",
            scale: "medium",
            margin: "0 0 0, 0",
            text: "Add",
            handler: function() {
                this.productBundleGrid.addItem();
            },
            scope: me
        }];

        this.defaults = {
            width: 200,
            product: this.product,
            productInCatalogInfo: this.productInCatalogInfo,
            labelAlign: 'top',
            labelSeparator: '',
            persistChangesToModel: true
        };

        this.record = this.product;

        this.productBundleGrid = Ext.create('Taco.view.product.widget.ProductBundleGrid', {
            product : me.product
        });

        readOnly = this.isEdit() || !(this.isSingleSite || this.isGlobal);
        visable = !readOnly || this.isEdit();
        requiredContent = this.isSingleSite || this.isGlobal;
        
        this.items = [
            this.productBundleGrid
        ];

        this.callParent(arguments);

        

        me.mon(me.productBundleGrid.store, 'datachanged', me.onStoreDataChanged, me);
        

    },
    
    onStoreDataChanged: function (bundleStore) {
        var me = this,
            productForm = me.up("productform");
        
        // when the contents of the bundle store chanes, we need to notifiy the other subForms of the changes so that they can react. Specifically, the shipping and price area will update;
        //todo change this to fire on the record instead of the productForm
        if (productForm) {
            productForm.fireEvent('bundleItemChange');
        }
    },

    // Called before the updateTask of Taco.core.ux.form.Form is executed; Return false to cancel the save; Can be used to manipulate the record data prior to saving;
    beforeSave: function () {
        /*
        var me = this;
        // need to serialize the store into jsons for persistance
        var store = this.productBundleGrid.store;
        var data = [];
        store.each(function(record) {
            data.push(Ext.clone(record.data));
        });
        
        this.product.set('bundledProducts', data);
        */
        return true;
    }
});