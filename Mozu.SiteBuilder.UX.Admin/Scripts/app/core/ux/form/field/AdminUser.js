/**
 * @class Taco.core.ux.form.field.Product
 */

Ext.define('Taco.core.ux.form.field.AdminUser', {
    extend: 'Ext.ux.form.field.BoxSelect',
    alias: ['widget.taco.field.product','widget.taco-productfield'],
    requires:[
        'Taco.store.AdminUsers'
    ],

    forceSelection: true,
    minChars: 3,
    triggerOnClick: false,
    typeAhead: true,

    displayField: 'fullName',
    fieldLabel: 'Select User',
    queryMode: 'local',
    valueField: 'id',

    initComponent : function () {
        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.AdminUsers');
        this.callParent(arguments);
    }
});
