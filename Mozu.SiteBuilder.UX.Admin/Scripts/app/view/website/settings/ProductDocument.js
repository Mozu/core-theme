/**
 * @class Taco.view.website.settings.Templates
 */

Ext.define('Taco.view.website.settings.ProductDocument', {
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
            entityType: 'product',
            emptyText:'[default]'
        }];

        this.callParent(arguments);
    }
});
