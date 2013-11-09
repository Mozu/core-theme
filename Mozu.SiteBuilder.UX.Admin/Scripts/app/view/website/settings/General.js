/**
 * @class Taco.view.website.settings.General
 */

Ext.define('Taco.view.website.settings.General', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.OnOffSliderButton'
    ],

    title: 'General',
    ui: 'subform',

    layout: {
        type: 'vbox'
    },

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
            fieldLabel: 'Navigation Link Name',
            width: '95%'
        }, {
            xtype: 'checkboxfield',
            name: 'show_in_nav',
            boxLabel: 'Show in Navigation'
        }, {
            xtype: 'checkboxfield',
            name: 'is_group_page',
            boxLabel: 'Use this page only to group other pages'
        }, {
            xtype: 'checkboxfield',
            name: '',
            boxLabel: 'Redirect page to'
        }, {
            xtype: 'textfield',
            name: 'redirect_url',
            width: '95%'
        }];

        this.callParent(arguments);
    }
});
