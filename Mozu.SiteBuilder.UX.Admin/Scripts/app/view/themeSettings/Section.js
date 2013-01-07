/**
 * @class Taco.view.themesettings.Section
 */
Ext.define('Taco.view.themesettings.Section', {
    extend: 'Ext.container.Container',
    alias: 'widget.themesettingssection',

    cls: 'taco-theme-section',
    laytout: 'auto',

    fieldDefaults: {
        labelAlign: 'left',
        labelWidth: 225,
        labelSeparator: ''
    },

    title: 'Section Title',
    collapsed: false,

    initComponent: function () {

        this.header = Ext.create('Ext.Component', {
            autoEl: 'h1',
            html: this.title,
            cls: this.collapsed ? 'collapsed' : ''
        });

        this.body = Ext.create('Ext.container.Container', {
            layout: 'auto',
            items: this.items,
            style: {
                display: this.collapsed ? 'none' : ''
            },
            defaults: this.fieldDefaults
        });

        this.items = [this.header, this.body];

        this.callParent(arguments);

        this.on({
            afterrender: this.onAfterRender,
            scope: this
        });
    },

    onAfterRender: function () {
        
        this.header.getEl().on({
            click: this.onHeaderClick,
            scope: this
        });
    },

    onHeaderClick: function () {
        if (this.collapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    },

    collapse: function () {
        if (this.collapsed) {
            return;
        }

        this.body.getEl().setStyle('display', 'none');
        this.header.addCls('collapsed');
        this.collapsed = true;
    },

    expand: function () {
        if (!this.collapsed) {
            return;
        }

        this.body.getEl().setStyle('display', '');
        this.header.removeCls('collapsed');
        this.collapsed = false;
    }
});