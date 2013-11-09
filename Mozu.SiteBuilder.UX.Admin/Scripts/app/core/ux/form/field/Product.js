/**
 * @class Taco.core.ux.form.field.Product
 */

Ext.define('Taco.core.ux.form.field.Product', {
    extend: 'Ext.ux.form.field.BoxSelect',
    alias: 'widget.taco.field.product',
    requires:[
        'Taco.store.ProductComboBox'
    ],

    forceSelection: true,
    minChars: 3,
    triggerOnClick: false,
    typeAhead: true,

    displayField: 'productName',
    fieldLabel: 'Select Products',
    queryMode: 'remote',
    valueField: 'productCode',

    initComponent : function () {
        this.store = Taco.core.data.StoreManager.getOrCreate({
           type: 'Taco.store.ProductComboBox'
        });
        
        this.callParent(arguments);
    }
});
