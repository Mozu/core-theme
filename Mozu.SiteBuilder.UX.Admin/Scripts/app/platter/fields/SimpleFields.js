/**
* The Discount list (grid) view
*/
Ext.define('Taco.platter.fields.SimpleFields', {
    singleton: true,
    requires: [
        'Ext.form.field.Text'
    ],
    constructor: function () {

    }
});

Ext.define('Taco.platter.fields.Text', {
    extend: 'Ext.form.field.Text',
    alias: ['widget.mz-input-text']
});


Ext.define('Taco.platter.fields.DropDown', {
    extend: 'Ext.form.field.ComboBox',
    alias: ['widget.mz-input-dropdown'],
    queryMode: 'local',
    editable: false,
    triggerAction: 'all',
    typeAhead: false

});

Ext.define('Taco.platter.fields.Checkbox', {
    extend: 'Ext.form.field.Checkbox',
    alias: ['widget.mz-input-checkbox']
    
});

Ext.define('Taco.platter.fields.Number', {
    extend: 'Ext.form.field.Number',
    alias: ['widget.mz-input-Number'],
    hideTrigger: true,
    mouseWheelEnabled: false

});


Ext.define('Taco.platter.fields.Image', {
    extend: 'Ext.form.field.Number',
    alias: ['widget.mz-input-image'],
    hideTrigger: true,
    mouseWheelEnabled: false

});

