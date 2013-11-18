/**
 * @class Taco.view.website.settings.Templates
 */

Ext.define('Taco.view.website.settings.WebDocument', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.field.PageTemplate'
    ],

    title: 'UI',
    ui: 'subform',

    layout: {
        type: 'vbox'
    },

    initComponent: function () {
        this.items = [{
            xtype: 'taco.field.pagetemplate',
            name: 'template',
            fieldLabel: 'Page Template',
            entityType: 'webpage'
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

        Ext.Object.each(values, function (key, value) {
            if (!values[key] && !this.record.get(key)) {
                delete values[key];
            }
        }, this);


        this.record.beginEdit();
        this.record.set(values);
        this.record.endEdit();

    }
});
