/**
 * @class Taco.shared.view.field.CountryField
 */
Ext.define('Taco.shared.view.field.CountryField', {
    extend: 'Ext.ux.form.field.BoxSelect',
    alias: 'widget.taco-countryfield',
    requires: [
        'Taco.store.CountryComboBox'
    ],
    
    width: 350,
    fieldLabel: 'Countries',
    queryMode: 'local',
    displayField: 'name',
    valueField: 'countryCode',
    emptyText: 'Select',
    allowBlank: false,
    
    createOnly: true,
    

    initComponent: function(eOpts) {
        var me = this;

        if (!me.store) {
            me.store = {
                type: "Taco.store.CountryComboBox",
                createOnly: me.createOnly
            };
        }
        
        me.callParent(arguments);
    }
});