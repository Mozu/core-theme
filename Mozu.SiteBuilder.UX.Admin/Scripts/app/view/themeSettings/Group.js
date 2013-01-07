/**
 * @class Taco.view.themesettings.Group
 */
Ext.define('Taco.view.themesettings.Group', {
    extend: 'Ext.container.Container',
    alias: 'widget.themesettingsgroup',

    cls: 'taco-theme-group',
    laytout: 'auto',

    fieldDefaults: {
        labelAlign: 'left',
        labelWidth: 225,
        labelSeparator: ''
    },

    title: 'Group Title',
    collapsed: false,

    initComponent: function () {

        this.header = Ext.create('Ext.Component', {
            autoEl: 'h2',
            html: this.title
        });

        this.body = Ext.create('Ext.container.Container', {
            layout: 'auto',
            items: this.items,
            defaults: this.fieldDefaults
        });

        this.items = [this.header, this.body];

        this.callParent(arguments);
    }
});