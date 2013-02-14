/**
 * @class Taco.core.ux.browser.Modal
 */
Ext.define('Taco.core.ux.browser.Modal', {
    extend: 'Taco.core.ux.modal.Modal',

    autoShow: true,
    width: 700,

    store: undefined,

    initComponent: function (eOpts) {
        var me = this;

        this.grid = Ext.create('Taco.core.ux.grid.Panel', {
            store: this.store,
            selType: 'cellmodel',
            margin: '20 0 0',
            columns: [{
                dataIndex: 'productCode',
                text: 'Code',
                width: 100
            }, {
                dataIndex: 'productName',
                text: 'Name',
                minWidth: 120,
                flex: 1,
                editor: {
                    xtype: 'textfield'
                }
            }, {
                dataIndex: 'price',
                text: 'Price',
                width: 100,
                renderer: function (value) {
                    return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
                },
                editor: {
                    xtype: 'currencyfield',
                    minValue: 0,
                    decimalPrecision: 2,
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false
                }
            }, {
                dataIndex: 'salePrice',
                text: 'Sale Price',
                width: 100,
                renderer: function (value) {
                    return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
                },
                editor: {
                    xtype: 'currencyfield',
                    minValue: 0,
                    decimalPrecision: 2,
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false
                }
            }],
            plugins: [{
                ptype: 'cellediting',
                clicksToEdit: 1
            }]
        });

        this.content = {
            xtype: 'container',
            items: [{
                xtype: 'component',
                autoEl: {
                    tag: 'h2',
                    html: 'Edit Products',
                    cls: Taco.baseCSSPrefix + 'modal-title'
                }
            }, this.grid
            ]
        };

        this.dirtybutton = Ext.create('Taco.core.ux.action.DirtyButton', {
            text: 'Save',
            listeners: {
                click: function () {
                    this.store.sync({
                        success: function () {
                            this.hide();
                        },
                        failure: function () {
                            this.hide();
                        },
                        scope: this
                    });
                },
                scope: this
            }
        });

        this.actions = {
            xtype: 'container',
            items: [this.dirtybutton, {
                xtype: 'action',
                text: 'Cancel',
                listeners: {
                    click: function () {
                        this.store.rejectChanges();
                        this.hide();
                    },
                    scope: this
                }
            }]
        };

        this.callParent(arguments);

        this.grid.on({
            edit: function (editor, e) {
                this.dirtybutton.setDirty(!Ext.isEmpty(this.store.getUpdatedRecords()));
            },
            scope: this
        });
    }
});