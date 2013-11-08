/**
 * @class Taco.view.website.settings.Templates
 */
 Ext.define('Taco.view.website.settings.Templates', {
     extend: 'Taco.core.ux.form.Form',
     ui: "subform",
     requires:['Taco.core.ux.form.field.PageTemplate'],
     title: "Templates",
     form: {
         layout: 'vbox',
         items: [
         
             {
                 xtype: 'taco.field.pagetemplate',
                 fieldLabel: 'Template',
                 entityType: 'webpage',
                 name: 'template'
             }
           
         ]
     }
 });