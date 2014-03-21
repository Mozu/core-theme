/**
 * @class Taco.view.catalog.Index
 * @author Jimmy Sanford
 *
 * This is just a file for component testing. It should probably be located somewhere else.
 */

Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.core.ux.window.Modal',
        'Taco.core.ux.content.SplitContainer'
    ],

    header: {
        title: 'Component Testing'
    },

    config: {
        mode: 'view',
        collapsedState: {
            west: false,
            east: true
        }
    },

    initComponent: function () {
        var items = [{
            xtype: 'panel',
            itemId: 'west',
            title: 'West',
            layout: 'fit',
            collapseDirection: 'left',
            collapseMode: 'mini',
            header: false,
            collapsible: true,
            animCollapse: false,
            flex: 1,
            items: [{
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
            }],
            rbar: {
                xtype: 'component',
                width: 13,
                style: {
                    backgroundColor: '#e6e6e6'
                },
                listeners: {
                    click: {
                        scope: this,
                        element: 'el',
                        fn: this.handleClickCollapseTool
                    }
                }
            }
        }, {
            xtype: 'splitter',
            collapseTarget: 'prev',
            collapsible: false,
            width: 4,
            style: {
                backgroundColor: '#bfbfbf',
                borderLeft: '4px solid #bfbfbf',
                overflow: 'hidden'
            }
        }, {
            xtype: 'panel',
            itemId: 'east',
            title: 'East',
            layout: 'fit',
            collapseDirection: 'right',
            collapseMode: 'mini',
            header: false,
            collapsible: true,
            collapsed: true,
            animCollapse: false,
            flex: 2,
            items: [{
                xtype: 'form',
                itemId: 'productForm',
                header: false,
                trackResetOnLoad: true,
                items: [{
                    xtype: 'textfield',
                    name: 'productName',
                    fieldLabel: 'Product Name',
                    allowOnlyWhitespace: false
                }]
            }],
            lbar: {
                xtype: 'component',
                width: 13,
                style: {
                    backgroundColor: '#e6e6e6'
                },
                listeners: {
                    click: {
                        scope: this,
                        element: 'el',
                        fn: this.handleClickCollapseTool
                    }
                }
            },
            listeners: {
                beforecollapse: {
                    scope: this,
                    fn: 'handleBeforeCollapseEast'
                }
            }
        }];

        var actions = [{
            xtype: 'button',
            itemId: 'cancel',
            scale: 'medium',
            ui: 'action',
            text: 'Cancel',
            hidden: true,
            scope: this,
            handler: this.handleClickCancel
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
            handler: this.handleClickSave
        }, {
            xtype: 'button',
            itemId: 'create',
            scale: 'medium',
            ui: 'action-primary',
            text: 'Create New Product',
            scope: this,
            handler: this.handleClickCreate
        }];

        Ext.apply(this.body, {
            cls: Taco.baseCSSPrefix + 'catalog',
            items: items,
            layout: {
                type: 'hbox',
                align: 'stretch'
            }
        });

        Ext.apply(this.header, {
            actions: actions
        });

        this.callParent(arguments);
    
        this.west = this.down('#west');
        this.east = this.down('#east');

        this.bindActionsToForm();
    },

    applyCollapsedState: function (nextState) {
        var prevState = this.getCollapsedState() || this.config.collapsedState;

        if (prevState.west !== nextState.west || prevState.east !== nextState.east) {
            nextState = Ext.apply({}, nextState, prevState);

            this.west[nextState.west ? 'collapse' : 'expand']();
            this.east[nextState.east ? 'collapse' : 'expand']();

            if (this.preventCollapsedStateChange === true) return;

            this.fireEvent('collapsedstatechange', this, nextState, prevState);
            this.onCollapsedStateChange(nextState, prevState);
        }

        return nextState;
    },

    applyMode: function (nextMode) {
        var prevMode = this.getMode() || this.config.mode;

        if (prevMode !== nextMode) {
            this.fireEvent('modechange', nextMode, prevMode);
            this.onModeChange(nextMode, prevMode);
        }

        return nextMode;
    },

    bindActionsToForm: function () {
        var actions = this.header.actionsContainer;
        var boundItems = this.east.down('form').getForm().getBoundItems();

        actions.items.each(function (item) {
            if (item.formBind) {
                boundItems.add(item);
            }
        });
    },

    changeRecord: function (record) {
        var nextTitle = 'Create Product';

        if (record) {
            this.setMode('edit');
            this.east.down('form').loadRecord(record);
            nextTitle = 'Edit ' + (record.get('productName') || 'Product');
        } else {
            this.resetForm();
        }

        this.setTitle(nextTitle);

        this.setCollapsedState({
            west: false,
            east: false
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
                    save: {
                        scope: me,
                        fn: 'handleClickCancel'
                    }
                }
            });
        }

        return !(isDirty);
    },

    handleClickCancel: function () {
        this.resetForm();

        this.setCollapsedState({
            west: false,
            east: true
        });
    },

    handleClickCollapseTool: function (e, el) {
        var direction = Ext.getCmp(el.id).ownerCt.getItemId();
        var prevState = this.getCollapsedState();

        this.setCollapsedState({
            west: (direction === 'west' && !prevState.east),
            east: (direction === 'east' && !prevState.west)
        });
    },

    handleClickCreate: function () {
        this.west.down('grid').getSelectionModel().deselectAll();

        this.resetForm();

        this.changeRecord(null);
    },

    handleClickSave: function () {
        var record = this.east.down('form').getForm().getRecord();
    },

    handleSelectionChange: function (selModel, selected) {
        var record = selected[0];

        this.changeRecord(record);
    },

    onCollapsedStateChange: function (nextState, prevState) {
        var record = this.east.down('form').getForm().getRecord();

        if (nextState.east === true) {
            this.setMode('view');
        } else {
            this.setMode(record ? 'edit' : 'create');
        }
    },

    onModeChange: function (nextMode, prevMode) {
        var record = this.east.down('form').getForm().getRecord();
        var actions = this.header.actionsContainer;
        var isView = (nextMode === 'view');
        var nextTitle = (isView ? 'Component Testing' : 'Create Product');

        if (nextMode === 'edit') {
            nextTitle = 'Edit ' + (record ? record.get('productName') || 'Product' : 'Product');
        }

        this.setTitle(nextTitle);

        actions.items.each(function (item) {
            item.setVisible(item.getItemId() === 'create' ? isView : !isView);
        });
    },

    resetForm: function (resetRecord) {
        this.east.down('form').getForm().reset(!(resetRecord === false));
    }
});
