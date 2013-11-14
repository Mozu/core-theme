/**
 * @class Taco.view.website.settings.Templates
 */

Ext.define('Taco.view.website.settings.CategoryDocument', {
    extend: 'Taco.core.ux.form.Form',
    requires:[
        'Taco.core.ux.form.field.PageTemplate'
    ],

    title: 'Templates',
    ui: 'subform',

    layout: {
        type: 'vbox'
    },

    initComponent: function () {
        this.items = [{
            xtype: 'taco.field.pagetemplate',
            name: 'template',
            fieldLabel: 'Template',
            entityType: 'category'
        }];

        this.callParent(arguments);
    },
    loadRecord: function (record, cascade) {
        var values = {};
        Ext.Array.each(this.record.data.items, function (kvp) {
            values[kvp.key] = kvp.value;
        }, this);
        this.getForm().setValues(values);
    },
    persistFormValues: function () {
        var values = this.getValues();

        this.record.beginEdit();
        this.record.set(values);
        this.record.endEdit();

    }
});
