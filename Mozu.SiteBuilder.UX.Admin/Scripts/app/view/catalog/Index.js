/**
 * @class Taco.view.catalog.Index
 * @author Jimmy Sanford
 *
 * This is just a file for component testing. It should probably be located somewhere else.
 */

Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.window.Modal'
    ],

    header: {
        title: 'Component Testing'
    },

    initComponent: function () {
        var items = [];

        items.push({
            xtype: 'button',
            scale: 'medium',
            ui: 'action',
            text: 'Click Me',
            handler: handleClick,
            scope: this
        });

        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            layout: 'auto',
            items: items
        });

        this.callParent(arguments);
    },

    handleClick: function () {
        if (this.modal) {
            this.modal.show();
        } else {
            this.modal = Ext.create('Taco.core.ux.window.Modal', {
                title: 'Foo',
                html: 'bar'
            });
        }
    },

    destroy: function () {
        this.callParent();
    }
});
