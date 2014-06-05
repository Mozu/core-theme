
/**
 * @class Taco.core.ux.form.field.Category
 */

Ext.define('Taco.core.ux.form.field.Category', {
    extend: 'Ext.ux.form.field.BoxSelect',
    alias: ['widget.taco.field.category','widget.taco-categoryfield'],
    requires:[
        'Taco.store.Categories'
    ],

    forceSelection: true,
    minChars: 3,
    triggerOnClick: false,
    typeAhead: true,

    displayField: 'name',
    fieldLabel: 'Select Categories',
    queryMode: 'remote',
    valueField: 'id',
    pageSize: 25,
    initComponent : function () {
        this.store = Taco.core.data.StoreManager.getOrCreate({
           type: 'Taco.store.Categories'
        });
        
        this.callParent(arguments);
    }
});
