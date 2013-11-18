/**
 * @class Taco.view.website.settings.General
 */

Ext.define('Taco.view.website.settings.General', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.OnOffSliderButton'
    ],

    title: 'General',
    ui: 'subform',

    layout: {
        type: 'vbox'
    },

    initComponent: function () {
        this.items = [{
            xtype: 'checkboxfield',
            name: 'hidden',
            boxLabel: 'Show in website'
        }, {
            xtype: 'label',
            text: 'Navigation'
        }, {
            xtype: 'textfield',
            name: 'link_title',
            emptyText: '[page name]',
            fieldLabel: 'Navigation Link Name',
            width: '95%'
        }, {
            xtype: 'taco.field.pagetemplate',
            name: 'template',
            fieldLabel: 'Page Template',
            entityType: 'webpage'
        },
        {
            xtype: 'checkboxfield',
            name: 'show_in_nav',
            boxLabel: 'Show in Navigation'
        },  {
            xtype: 'checkboxfield',
            name: '',
            boxLabel: 'Redirect page to'
        }, {
            xtype: 'textfield',
            name: 'redirect_url',
            emptyText: '[none]',
            width: '95%'
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
        this.record.set( values);
        this.record.endEdit();
       
    }
   
});
