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
                fieldLabel: 'Show in website',
                name: 'showInWebsite',
                enableToggle: true
            },
            {
                html: '<h4>Navigation</h4>'
            },
            {
                xtype: 'textfield',
                fieldLabel: 'Navigation Link Name',
                name: 'navLinkName'
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Show in Navigation',
                name: 'showInNav'
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Use this page only to group other pages',
                name: 'isGroupPage'
            },
            {
                xtype: 'checkbox',
                fieldLabel: 'Redirect page to:',
                name: 'isRedirect'
            },
            {
                xtype: 'textfield',
                name: 'redirectUrl'
            }
        ]
    }
});