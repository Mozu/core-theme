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
        var items = [],
            store,
            editor;

        store = Ext.create('Ext.data.Store', {
            fields: ['model', 'color'],
            data: [
                { color: 'red', model: 'Mustang' },
                { color: 'yellow', model: 'Corvette' },
                { color: 'blue', model: 'Camaro' }
            ]
        });

        editor = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToEdit: 2
        });

        items.push({
            xtype: 'grid',
            store: store,
            // enableColumnResize: false,
            selType: 'checkboxmodel',
            selModel: {
                checkOnly: true,
                ignoreRightMouseSelection: true,
                headerWidth: 37
            },
            plugins: [
                editor
            ],
            columns: [{
                dataIndex: 'model',
                text: 'Model',
                flex: 3,
                editor: {
                    xtype: 'textfield',
                    allowOnlyWhitespace: false
                }
            }, {
                dataIndex: 'color',
                text: 'Color',
                width: 200,
                editor: {
                    xtype: 'textfield',
                    allowOnlyWhitespace: false
                }
            }]
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
