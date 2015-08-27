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
    containers: [{
        xtype: 'panel',
        collapsible: 'true',
        ui: 'subform',
        title: 'General',
        itemId: 'generalPanel',
        margin: '10 0 0 0',


        items: [{
            fieldLabel: 'Page Name',
            name: 'document.name',
            xtype: 'slugfield',
            allowOnlyWhitespace: false

        }, {
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
        //removing for now .. until nav ui is refactored into library
        //{
        //    xtype: 'checkboxfield',
        //    name: 'hide_in_nav',
        //    boxLabel: 'Hide in Navigation'
        //},

        {
            xtype: 'textfield',
            fieldLabel: 'Redirect page to',
            name: 'redirect_url',
            emptyText: '[none]'
        }, {
            xtype: 'taco-codefield',
            minHeight: 200,
            maxHeight: 400,
            mode: 'html',
            name: 'extended_header_content',
            fieldLabel: 'Additional Header Tags',
            emptyText: '[none]'
        }]
    },{
        margin: '10 0 0 0',
        xtype: 'panel',
        collapsible: 'true',
        ui: 'subform',
        title: 'SEO',
        itemId: 'seoPanel',
        items: [{
            xtype: 'textfield',
            name: 'meta_title',
            fieldLabel: 'Meta Title'
        }, {
            xtype: 'textarea',
            name: 'meta_description',
            fieldLabel: 'Meta Description'
        }]
    }],
    initComponent: function() {
        this.items = (this.items || []).concat(this.containers || []);
        this.callParent(arguments);

        this.generalPanel = this.down('#generalPanel');
        this.seoPanel = this.down('#seoPanel');

    },

    setData: function(data) {
        if (this.getForm()) {
            this.getForm().setValues(data);
        }
        this.data = data;
    },
    getData: function () {
        return this.getValues(false, false, false, true);

    }
});