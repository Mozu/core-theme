/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.overrides.panel.Tool',
        'Taco.overrides.form.Basic',
        'Taco.core.ux.window.Alert'
    ],

    header: {
        title: 'Catalog Testing'
    },

    initComponent: function () {
        var items = [];

        items.push({
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Launch Alert',
            margin: '0 0 20',
            scope: this,
            handler: this.launchModal
        });

        this.combo = Ext.create('Ext.form.FieldContainer', {
            id: 'bob',
            fieldLabel: 'Container',
            items: [{
                xtype: 'combobox',
                editable: false,
                forceSelection: true,
                hideTrigger: true,
                queryMode: 'local',
                collapse: Ext.emptyFn,
                listConfig: {
                    autoRender: 'bob',
                    floating: false,
                    hidden: false,
                    multiSelect: true,
                    height: 300,
                    width: 300
                },
                listeners: {
                    boxready: function (cmp) { cmp.expand(); }
                },
                store: ['red', 'green', 'blue']
            }]
        });

        items.push(this.combo);

        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            layout: 'auto',
            items: items
        });

        this.callParent(arguments);
    },

    launchModal: function () {
        if (this.modal) {
            this.modal.show();
            return;
        }

        this.modal = Ext.create('Taco.core.ux.window.Alert', {
            title: 'Hello',
            html: 'Foo bar'
        });

        this.modal.show();
    }
});
