/**
 * @class  Taco.core.ux.CategoryComboBox
 */

Ext.define('Taco.core.ux.CategoryComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.categorycombobox',
    requires: ['Taco.store.Categories'],
    displayField: 'name',
    valueField: 'id',
    minChars: 1,
    store: { type: 'Taco.store.Categories', clearFilters: true, clearSort: true, autoLoad: true }
    //,
    //initComponent: function () {
    //    var me = this;
    //    //me.store = Taco.core.data.StoreManager.getOrCreate( { type:'Taco.store.Categories',  clearFilters: true, clearSort: true, autoLoad: true });
    //    me.callParent(arguments);
    //}
    
});
