/**
 * @class Taco.core.ux.form.field.Product
 */

Ext.define('Taco.core.ux.form.field.AdminUser', {
    extend: 'Ext.form.ComboBox',
    alias: ['widget.taco-adminuserfield'],
    requires:[
        'Taco.store.AdminUsers'
    ],

    
    fieldLabel: 'Users',
    valueField: 'id',
    displayField: 'fullName',
    queryMode: 'local',
    valueNotFoundText: 'not found',
    editable: true,
    forceSelection: true,
    
    store: { type: 'Taco.store.AdminUsers' }
});
