/**
 * @class Taco.view.website.settings.General
 */

Ext.define('Taco.view.website.settings.Template', {
    extend: 'Taco.view.website.settings.CmsBaseForm',
    requires: [
        'Taco.core.ux.form.OnOffSliderButton'
    ],

    title: 'General',

    initComponent: function () {
        this.items = [ {
                xtype: 'textareafield',
                name: 'extended_header_content',
                fieldLabel: 'Additional Header Tags',
                emptyText: '[none]'
            }];

        this.callParent(arguments);
    }   
});