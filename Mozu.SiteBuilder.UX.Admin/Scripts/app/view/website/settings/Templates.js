/**
 * @class Taco.view.website.settings.Templates
 */

Ext.define('Taco.view.website.settings.Templates', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.field.PageTemplate'
    ],

    title: 'Templates',
    ui: 'subform',

    layout: {
        type: 'vbox'
    },

    initComponent: function () {
        this.items = [{
            xtype: 'taco.field.pagetemplate',
            name: 'template',
            fieldLabel: 'Template',
            entityType: 'webpage'
        }];

        this.callParent(arguments);
    }
});
