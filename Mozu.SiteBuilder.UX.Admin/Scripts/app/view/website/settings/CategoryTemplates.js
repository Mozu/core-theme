/**
 * @class Taco.view.website.settings.Templates
 */
 Ext.define('Taco.view.website.settings.CategoryTemplates', {
     extend: 'Taco.core.ux.form.Form',
     ui: "subform",
     requires:['Taco.core.ux.form.field.PageTemplate'],
     title: "Templates",
     cls: 'taco-sidebar-modal-templates',
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