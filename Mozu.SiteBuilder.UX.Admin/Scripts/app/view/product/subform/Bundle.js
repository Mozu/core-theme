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
            margin: "0 0 20, 0",
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
    }
});