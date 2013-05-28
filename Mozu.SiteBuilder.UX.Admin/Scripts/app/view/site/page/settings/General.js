/**
 * @class Taco.view.site.page.settings.General
 */
Ext.define('Taco.view.site.page.settings.General', {
    extend: 'Taco.view.site.page.PageSettingsPanel',
    requires: ['Taco.core.ux.form.OnOffSliderButton'],
    title: 'General',
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
                xtype: 'label',
                cls: 'taco-sublabel-text',
                text: 'This is explanitaion copy...'
            },
            {
                xtype: 'checkboxfield',
                boxLabel: 'Show in Navigation',
                name: 'show_in_nav'
            },
            {
                xtype: 'label',
                cls: 'taco-sublabel-text',
                text: 'This is explanitaion copy...'
            },
            {
                xtype: 'checkboxfield',
                boxLabel: 'Use this page only to group other pages',
                name: 'is_group_page'
            },
            {
                xtype: 'label',
                cls: 'taco-sublabel-text',
                text: 'This is explanitaion copy...'
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
            },
            {
                xtype: 'label',
                cls: 'taco-sublabel-text-last',
                text: 'This is explanitaion copy...'
            }
        
        ]
    }
});
