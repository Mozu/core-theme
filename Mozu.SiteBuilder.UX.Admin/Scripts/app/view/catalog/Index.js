/**
 * @class Taco.view.catalog.Index
 * @author Jimmy Sanford
 *
 * This is just a file for component testing. It should probably be located somewhere else.
 */

Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.form.FilterContainer'
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

    handleDialogSave: Ext.emptyFn,

    handleToggle: function (button, state) {
        if (state) {
            if (!this.dialog) {
                this.dialog = Ext.create('Taco.core.ux.window.Modal', {
                    title: 'Image Widget',
                    tools: [{
                        xtype: 'button',
                        ui: 'action',
                        scale: 'medium',
                        text: 'Content',
                        toggleGroup: 'imageWidgetTabs',
                        allowDepress: false,
                        enableToggle: true,
                        pressed: true,
                        scope: this,
                        style: {
                            borderRadius: '2px 0px 0px 2px'
                        },
                        handler: function () {
                            this.dialog.getForm().getLayout().setActiveItem(0);
                        }
                    }, {
                        xtype: 'button',
                        ui: 'action',
                        scale: 'medium',
                        text: 'Style',
                        toggleGroup: 'imageWidgetTabs',
                        allowDepress: false,
                        enableToggle: true,
                        scope: this,
                        style: {
                            borderRadius: '0px 2px 2px 0px'
                        },
                        handler: function () {
                            this.dialog.getForm().getLayout().setActiveItem(1);
                        }
                    }],
                    scale: 'large',
                    layout: {
                        type: 'fit'
                    },
                    items: [{
                        xtype: 'formform',
                        layout: {
                            type: 'card'
                        },
                        items: [{
                            xtype: 'formform',
                            title: 'Content',
                            header: false,
                            items: [{
                                xtype: 'button',
                                ui: 'action',
                                scale: 'medium',
                                text: 'Select Existing'
                            }]
                        }, {
                            xtype: 'formform',
                            title: 'Style',
                            header: false,
                            items: [{
                                xtype: 'container',
                                layout: {
                                    type: 'hbox'
                                },
                                items: [{
                                    xtype: 'combobox',
                                    name: 'borderWidth',
                                    fieldLabel: 'Border Width',
                                    editable: false,
                                    forceSelection: true,
                                    store: ['1px', '2px', '3px']
                                }, {
                                    xtype: 'combobox',
                                    name: 'borderStyle',
                                    fieldLabel: 'Border Style',
                                    editable: false,
                                    forceSelection: true,
                                    store: ['Solid', 'Dashed', 'Dotted', 'None']
                                }, {
                                    xtype: 'textfield',
                                    name: 'borderColor',
                                    fieldLabel: 'Border Color'
                                }]
                            }]
                        }]
                    }]
                });

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
        } else {
            if (this.dialog) {
                this.dialog.close();
            }
        }
    }
});
