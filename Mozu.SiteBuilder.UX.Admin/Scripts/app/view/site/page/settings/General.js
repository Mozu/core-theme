/**
 * @class Taco.view.site.page.settings.General
 */
Ext.define('Taco.view.site.page.settings.General', {
    extend: 'Taco.view.site.page.PageSettingsPanel',
    title: 'General',
    form: {
        layout: 'vbox',
        items: [
            {
                xtype: 'button',
                text: 'Hide in website',
                name: 'hidden',
                enableToggle: true
            },
            {
                html: '<h4>Navigation</h4>'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Navigation Link Name',
                name: 'link_title'
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Show in Navigation',
                name: 'show_in_nav'
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Use this page only to group other pages',
                name: 'is_group_page'
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Redirect page to:',
                name: ''
            },
            {
                xtype: 'textfield',
                name: 'redirect_url'
            }
        ]
    }
});