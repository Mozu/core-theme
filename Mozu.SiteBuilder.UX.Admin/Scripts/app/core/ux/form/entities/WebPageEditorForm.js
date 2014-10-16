/**
 * @class Taco.core.ux.form.ColorField
 */

Ext.define('Taco.core.ux.form.entities.WebPageEditorForm', {
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
            margin: '10 0 0 0',
            xtype: 'panel',
            collapsible: 'true',
            ui: 'subform',
            title: 'SEO',
            itemId: 'seoPanel',
            items: [
                {
                    xtype: 'textfield',
                    name: 'meta_title',
                    fieldLabel: 'Meta Title'
                }, {
                    xtype: 'textarea',
                    name: 'meta_description',
                    fieldLabel: 'Meta Description'
                }
            ]
        },
        {
            xtype: 'panel',
            collapsible: 'true',
            ui: 'subform',
            title: 'General',
            itemId: 'generalPanel',
            margin: '10 0 0 0',


            items: [
                {
                    xtype: 'checkboxfield',
                    name: 'hidden',
                    boxLabel: 'Hide in website'
                }, {
                    xtype: 'textfield',
                    name: 'link_title',
                    emptyText: '[page name]',
                    fieldLabel: 'Navigation Link Name'
                }, {
                    xtype: 'taco-field-pagetypes',
                    name: 'page_type_definition',
                    fieldLabel: 'Page Template',
                    entityType: 'webpage'
                },
                {
                    xtype: 'checkboxfield',
                    name: 'hide_in_nav',
                    boxLabel: 'Hide in Navigation'
                }, {
                    xtype: 'textfield',
                    fieldLabel:'Redirect page to',
                    name: 'redirect_url',
                    emptyText: '[none]'
                }, {
                    xtype: 'textareafield',
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
        this.seoPanel = this.down('#seoPanel');

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