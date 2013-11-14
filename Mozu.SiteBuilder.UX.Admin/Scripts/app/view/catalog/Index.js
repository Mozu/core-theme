/**
 * @class Taco.view.catalog.Index
 * @author Jimmy Sanford
 *
 * This is just a file for component testing. It should probably be located somewhere else.
 */

Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [],

    header: {
        title: 'Catalog Testing',
        flexFirstItem: false,
        items: {
            xtype: 'component',
            html: 'hi',
            flex: 1
        },
        actions: [{
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Test'
        }]
    },

    initComponent: function () {
        var items;

        items = [{
            xtype: 'button',
            itemId: 'saveButton',
            ui: 'action-primary',
            scale: 'medium',
            text: 'Save',
            allowDepress: false,
            enableToggle: false,
            scope: this,
            handler: this.handleSave,
            toggleHandler: this.handleToggle
        }];

        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            layout: 'auto',
            items: items
        });

        this.callParent(arguments);

        this.down('#saveButton').on({
            beginsave: {
                scope: this,
                fn: function (button) {
                    button.addCls('thom');
                }
            },
            endsave: {
                scope: this,
                fn: function (button) {
                    button.removeCls('thom');
                }
            }
        });
    },

    handleSave: function (button, e) {
        button.fireEvent('beginsave', button);

        Ext.defer(function () {
            button.fireEvent('endsave', button);
        }, 2000, this);
    },

    handleToggle: function (button, state) {
        console.log('toggle handler', state);
    }
});
