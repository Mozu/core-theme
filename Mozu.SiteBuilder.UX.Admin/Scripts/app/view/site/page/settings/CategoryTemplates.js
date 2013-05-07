/**
 * @class Taco.view.site.page.settings.Templates
 */
Ext.define('Taco.view.site.page.settings.CategoryTemplates', {
    extend: 'Taco.view.site.page.PageSettingsPanel',
    requires:['Taco.core.ux.form.field.PageTemplate'],
    title: "Templates",
    form: {
        layout: 'vbox',
        items: [

            {
                xtype: 'taco.field.pagetemplate',
                fieldLabel: 'Template',
                entityType: 'category',
                name: 'template'
            }

        ]
    }
});