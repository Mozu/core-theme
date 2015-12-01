/**
 * 
 */
Ext.define('Taco.view.settings.publishing.Form', {
    extend: 'Taco.core.ux.form.NavForm2',
    requires: [
        'Taco.view.settings.publishing.subform.PublishSettings'
    ],
    title: 'Publishing Settings',
    initComponent: function () {
        var me = this;

        me.publishSettings = Ext.create('Taco.view.settings.publishing.subform.PublishSettings', me);

        me.items = [
            me.publishSettings
        ];

        me.callParent(arguments);

    }
});