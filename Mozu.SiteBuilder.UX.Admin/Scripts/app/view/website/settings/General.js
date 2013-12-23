/**
 * @class Taco.view.website.settings.General
 */

Ext.define('Taco.view.website.settings.General', {
    extend: 'Taco.view.website.settings.CmsBaseForm',
    requires: [
        'Taco.core.ux.form.OnOffSliderButton'
    ],

    title: 'General',

    initComponent: function () {
        this.items = [{
                xtype: 'checkboxfield',
                name: 'hidden',
                boxLabel: 'Show in website'
            }, {
                xtype: 'label',
                text: 'Navigation'
            }, {
                xtype: 'textfield',
                name: 'link_title',
                emptyText: '[page name]',
                fieldLabel: 'Navigation Link Name'
            }, {
                xtype: 'taco.field.pagetemplate',
                name: 'template',
                fieldLabel: 'Page Template',
                entityType: 'webpage'
            },
            {
                xtype: 'checkboxfield',
                name: 'show_in_nav',
                boxLabel: 'Show in Navigation'
            }, {
                xtype: 'checkboxfield',
                name: '',
                boxLabel: 'Redirect page to'
            }, {
                xtype: 'textfield',
                name: 'redirect_url',
                emptyText: '[none]'
            }, {
                xtype: 'textareafield',
                name: 'extended_header_content',
                fieldLabel: 'Additional Header Tags',
                emptyText: '[none]'
            }];

        this.callParent(arguments);
    }   
});