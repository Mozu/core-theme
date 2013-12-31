/**
 * @class Taco.view.website.settings.Templates
 */

Ext.define('Taco.view.website.settings.CategoryDocument', {
    extend: 'Taco.view.website.settings.CmsBaseForm',
    requires:[
        'Taco.core.ux.form.field.PageTemplate'
    ],

    title: 'UI',


    initComponent: function () {
        this.items = [{
            xtype: 'taco.field.pagetemplate',
            name: 'template',
            fieldLabel: 'Page Template',
            entityType: 'category'
        }, {
            xtype: 'textareafield',
            name: 'extended_header_content',
            fieldLabel: 'Additional Header Tags',
            emptyText: '[none]'
        }];

        this.callParent(arguments);
    }
});
