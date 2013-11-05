/**
 * @class Taco.core.ux.form.field.MultiSelect
 * @author Jimmy Sanford
 * Extends Ext.ux.form.MultiSelect.
 */
Ext.define('Taco.core.ux.form.field.Product', {
    extend: 'Ext.ux.form.field.BoxSelect',
    alias: 'widget.taco.field.product',
    requires:['Taco.store.ProductComboBox'],
    triggerOnClick: false,
    forceSelection: true,
    minChars: 3,
    typeAhead: true,
    queryMode:'remote',
    displayField: 'productName',
    fieldLabel: 'Select Products',
    valueField: 'productCode',
    initComponent : function () {
        var me = this;
        me.store = Taco.core.data.StoreManager.getOrCreate(
           {
               type: 'Taco.store.ProductComboBox'
           });
        
        me.callParent();
       

    },   
});