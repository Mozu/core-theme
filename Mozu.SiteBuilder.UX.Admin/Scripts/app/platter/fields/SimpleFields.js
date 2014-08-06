/**
* The Discount list (grid) view
*/
Ext.define('Taco.platter.fields.SimpleFields', {
    singleton: true,
    requires: [
        'Ext.form.field.Text',
        'Taco.core.ux.form.field.BaseImageField',
        'Ext.form.field.Checkbox',
        'Ext.form.field.Number',
        'Ext.form.field.ComboBox',
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
    extend: 'Taco.core.ux.form.field.BaseImageField',
    alias: ['widget.mz-input-image'],
   
});

