/**
 * @class Taco.view.catalog.Index
 * @author Jimmy Sanford
 *
 * This is just a file for component testing. It should probably be located somewhere else.
 */

Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.form.FilterContainer',
        'Taco.view.website.widgetEditors.Image'
    ],

    header: {
        title: 'Component Testing'
    },

    initComponent: function () {
        var items;

        items = [{
            xtype: 'button',
            itemId: 'switch',
            ui: 'action',
            scale: 'medium',
            text: 'Launch Image Widget',
            enableToggle: true,
            scope: this,
            toggleHandler: this.handleToggle
        }, {
            xtype: 'button',
            ui: 'action-toggle',
            scale: 'medium',
            text: 'Enable Application',
            margin: '0 0 0 10',
            enableToggle: true,
            scope: this,
            toggleHandler: function (button, state) { button.setText(state ? 'Disable Application' : 'Enable Application'); }
        }];

        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            layout: 'auto',
            items: items
        });

        this.callParent(arguments);
    },

    handleDialogClose: function (dialog) {
        this.down('#switch').toggle(false);
    },

    handleDialogSave: function (dialog) {
        console.log(dialog.getForm().getValues());
    },

    handleToggle: function (button, state) {
        if (state) {
            if (!this.dialog) {
                this.dialog = Ext.create('Taco.view.website.widgetEditors.Image');

                this.dialog.on({
                    close: {
                        scope: this,
                        fn: 'handleDialogClose'
                    },
                    save: {
                        scope: this,
                        fn: 'handleDialogSave'
                    }
                });
            }

            this.dialog.show();
        } else if (this.dialog) {
            this.dialog.close();
        }
    }
});
