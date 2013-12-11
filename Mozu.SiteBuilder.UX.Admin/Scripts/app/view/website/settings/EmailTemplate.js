/**
 * @class Taco.view.website.settings.Templates
 */

Ext.define('Taco.view.website.settings.EmailTemplate', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.field.HtmlEditor'
    ],

    title: 'UI',
    ui: 'subform',

    layout: {
        type: 'vbox'
    },
    defaults: {
        xtype: 'htmleditor',
        width: '95%',
        enableFont:false
    },

    initComponent: function () {
        this.items = [{
            name: 'subject',
            xtype: 'textfield',
            fieldLabel: 'Subject Line'
        }, {
            name: 'html_1',
            fieldLabel: 'Html block 1'
        }, {
            name: 'html_2',
            fieldLabel: 'Html block 2'
        }, {
            name: 'html_3',
            fieldLabel: 'Html block 3'
        }, {
            name: 'html_4',
            fieldLabel: 'Html block 4'
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
        var values = this.getValues(false, false, false, true);

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
