/**
 * @class Taco.view.website.settings.General
 */
 Ext.define('Taco.view.website.settings.General', {
     extend: 'Taco.core.ux.form.Form',
     requires: ['Taco.core.ux.form.OnOffSliderButton'],
     title: 'General',
     ui: "subform",
     cls: 'taco-sidebar-modal-general',
     form: {
         layout: 'vbox',
         items: [
             {
                 xtype: 'onoffsliderbutton',
                 name: 'hidden',
                 text: 'Show in website'
             },
             {
                 xtype: 'label',
                 text: 'Navigation'
             }, 
             {
                 xtype: 'textfield',
                 fieldLabel: 'Navigation Link Name',
                 width: '95%',
                 name: 'link_title'
             },
             {
                 xtype: 'checkboxfield',
                 boxLabel: 'Show in Navigation',
                 name: 'show_in_nav'
             },
             {
                 xtype: 'checkboxfield',
                 boxLabel: 'Use this page only to group other pages',
                 name: 'is_group_page'
             },
             {
                 xtype: 'checkboxfield',
                 boxLabel: 'Redirect page to',
                 name: ''
             },
             {
                 xtype: 'textfield',
                 width: '95%',
                 name: 'redirect_url'
             }
        
         ]
     }
 });
