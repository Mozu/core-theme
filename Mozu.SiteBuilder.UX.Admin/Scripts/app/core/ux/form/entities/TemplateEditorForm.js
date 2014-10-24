/**
 * @class Taco.core.ux.form.ColorField
 */

Ext.define('Taco.core.ux.form.entities.TemplateEditorForm', {
    extend: 'Taco.core.ux.form.entities.EntityEditorForm',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    defaults: {
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
    },
    containers: [
        {
            xtype: 'panel',
            collapsible: 'true',
            ui: 'subform',
            title: 'General',
            itemId: 'generalPanel',
            margin: '10 0 0 0',


            items: [
               
                 {
                     xtype: 'taco-codefield',
                     minHeight: 200,
                     maxHeight: 400,
                     mode: 'html',
                    name: 'extended_header_content',
                    fieldLabel: 'Additional Header Tags',
                    emptyText: '[none]'
                }
            ]
        }
    ],
    initComponent: function () {
        this.items = (this.items || []).concat(this.containers || []);
        this.callParent(arguments);

        this.generalPanel = this.down('#generalPanel');
       

    },

    setData: function (data) {
        if (this.getForm()) {
            this.getForm().setValues(data);
        }
        this.data = data;
    },
    getData: function () {
        var data = this.getValues(false, false, false, true);
        return Ext.applyIf(data, this.data);
    }
});