/**
 * @class Taco.view.catalog.Index
 * @author Jimmy Sanford
 *
 * This is just a file for component testing. It should probably be located somewhere else.
 */

Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.form.SplitEditor',
    requires: [
        'Taco.core.ux.window.Modal'
    ],

    recordNameField: 'productName',
    recordType: 'Special Product',

    header: {
        title: 'Component Testing'
    },

    initComponent: function () {
        var actions = [{
            xtype: 'button',
            itemId: 'cancel',
            scale: 'medium',
            ui: 'action',
            text: 'Cancel',
            hidden: true,
            scope: this,
            handler: this.doCancel
        }, {
            xtype: 'button',
            itemId: 'save',
            scale: 'medium',
            ui: 'action-primary',
            text: 'Save',
            margin: '0 0 0 10',
            formBind: true,
            hidden: true,
            scope: this,
            handler: this.doSave
        }, {
            xtype: 'button',
            itemId: 'create',
            scale: 'medium',
            ui: 'action-primary',
            text: 'Create New Product',
            scope: this,
            handler: this.doCreate
        }];

        Ext.apply(this.header, {
            actions: actions
        });

        this.config.west = [{
            xtype: 'grid',
            store: Taco.core.data.StoreManager.getOrCreate('Taco.store.Products'),
            columns: [{
                dataIndex: 'productName',
                text: 'Name',
                flex: 1
            }],
            listeners: {
                selectionchange: {
                    scope: this,
                    fn: 'handleSelectionChange'
                }
            }
        }];

        this.config.east = [{
            xtype: 'form',
            itemId: 'productForm',
            header: false,
            items: [{
                xtype: 'textfield',
                name: 'productName',
                fieldLabel: 'Product Name',
                allowOnlyWhitespace: false
            }]
        }];

        this.callParent(arguments);

        this.on({
            recordchange: {
                scope: this,
                fn: function () {
                    console.log('recordchange', arguments);
                }
            }
        });
    },

    handleBeforeCollapseEast: function (panel, direction, animate) {
        var me = this;
        var isDirty = this.preventCollapsedStateChange = panel.down('form').isDirty();

        if (isDirty) {
            Ext.create('Taco.core.ux.window.Modal', {
                scale: 'small',
                title: 'Confirm',
                primaryText: 'Yes, discard changes',
                secondaryText: 'No, continue editing',
                autoShow: true,
                actionBar: {
                    layout: {
                        type: 'hbox',
                        pack: 'center'
                    }
                },
                items: [{
                    xtype: 'component',
                    html: 'Unsaved changes to this form will be lost.'
                }],
                listeners: {
                    savesuccess: {
                        scope: me,
                        fn: 'doCancel'
                    }
                }
            });
        }

        return !(isDirty);
    },

    onModeChange: function (nextMode, prevMode) {
        var isView = (nextMode === 'view');
        var actions = this.header.actionsContainer;

        this.callParent(arguments);

        actions.items.each(function (item) {
            item.setVisible(item.getItemId() === 'create' ? isView : !isView);
        });
    }
});
