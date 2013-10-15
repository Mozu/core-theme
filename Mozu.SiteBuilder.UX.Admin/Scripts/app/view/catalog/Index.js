/**
 * @class Taco.view.catalog.Index
 * @author Jimmy Sanford
 *
 * This is just a file for component testing. It should probably be located somewhere else.
 */

Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.overrides.panel.Tool',
        'Taco.overrides.form.Basic',
        'Taco.core.ux.window.Alert',
        'Taco.core.ux.form.field.InlinePicker'
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

        this.modal = Ext.create('Taco.core.ux.window.Modal', {
            title: 'Hello',
            scale: 'large',
            items: [{
                xtype: 'formform',
                items: [{
                    xtype: 'taco-inlinepicker',
                    fieldConfig: {
                        name: 'color',
                        fieldStyle: {
                            backgroundColor: '#fff !important'
                        },
                        store: ['red', 'green', 'blue']
                    }
                }]
            }]
        });

        this.modal.on({
            save: {
                scope: this,
                fn: function (dialog) { console.log('save clicked', dialog.getForm().getValues()); }
            }
        });

        this.modal.show();
    }
});
