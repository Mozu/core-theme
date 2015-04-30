Ext.define('Taco.view.order.subform.fulfillment.Grid', {
    extend: 'Ext.grid.Panel',

    requires: [
        'Ext.grid.plugin.CellEditing'
    ],

    config: {
        plugins: [],
        unfulfilledFieldName: null,
        moveToNewText: 'New Package',
        createAction: 'createPackage',
        moveAction: 'movePackageItems'
    },

    packageData: null,

    listeners: {
        beforeedit: function() {
            // disable editing when the grid is not editMode:true
            return this.editMode;
        },
        selectionchange: function(view, selected) {
            //todo: fix the taco.split button to allow it to be enabled and disabled;
            if (!this.moveMenuAction) return;

            this.moveMenuAction[selected.length ? 'enable' : 'disable']();
        }
    },

    initComponent: function() {

        this.cls = [this.cls, Taco.baseCSSPrefix + 'orderform-shipping-shippingitemgrid'].join(' ');

        if (this.packageData) this.data = this.packageData.items;

        this.store = Ext.create('Ext.data.JsonStore', {
            data: this.data,
            fields: [{
                name: 'productCode',
                type: 'string',
                useNull: false
            }, {
                name: 'productName',
                type: 'string',
                useNull: true
            }, {
                name: 'quantity',
                type: 'int',
                useNull: true
            }, {
                name: 'weight',
                type: 'float',
                defaultValue: 0
            }, {
                name: 'isPackagedStandAlone',
                type: 'boolean'
            },            {
                name: 'fulfillmentMethod',
                type: 'string',
                useNull: true,
            }, {
                name: 'fulfillmentLocationCode',
                type: 'string',
                useNull: true
            }, {
                name: 'lineId',
                type: 'int',
                unseNull: false
            }, {
                name: 'fulfillmentStatus',
                type: 'string',
                useNull: true
            }],
            sorters: [{
                sorterFn: function (a, b) {
                    if (a.get('lineId') === b.get('lineId')) {
                        return 0;
                    }
                    return (a.get('lineId') < b.get('lineId') ? -1 : 1);
                }
            }]
        });

        this.isShippedPackage = this.packageData && this.packageData.status === 'Fulfilled';


        if (!this.isShippedPackage) {
            this.getPlugins().push(Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1
            }));

            this.on('viewready', function() {
                this.getSelectionModel().selectAll(true);
            });

            this.selModel = Ext.create('Ext.selection.CheckboxModel', {
                selType: 'checkboxmodel',
                checkOnly: true,
                injectCheckbox: 'last',
                headerWidth: 37,
                showHeaderCheckbox: true
            });

            this.buildToolbar();
        }

        Ext.apply(this, {
            viewConfig: {
                overItemCls: 'taco-order-shippingItem-grid-row-over',
                emptyText: '<div class="empty-grid-message">No items to display</div>',
                deferEmptyText: false,
                stripeRows: false,
                disabled: false, // disables the grid, prevents the field editors from opening. prevents default hover behavior. Makes text grey and background grey. TODOs, explore this as an option for making the grid readony.
                disabledCls: 'taco-order-shippingitemgrid-disabled'
            },
            columns: this.getColumnConfig()
        });

        this.callParent(arguments);
    },

    getColumnConfig: function() {
        var columns = [];

        columns.push({
            text: 'Line',
            draggable: false,
            resizable: true,
            width: 50,
            sortable: false,
            menuDisabled: true,
            hidden: false,
            align: 'center',
            dataIndex: 'lineId'
        }, {
            text: 'Code',
            draggable: false,
            width: 140,
            sortable: false,
            menuDisabled: true,
            align: 'left',
            dataIndex: 'productCode'
        }, {
            text: 'Products',
            draggable: false,
            xtype: 'templatecolumn',
            flex: 1,
            sortable: false,
            menuDisabled: true,
            tpl: [
                '<span class="productname" >{productName}</span>',
                '<span class="product-options">',
                '<tpl for="options">',
                '<span class="option">{.}, </span>',
                '</tpl>',
                '</span>'
            ],
            dataIndex: 'productName'
        }, {
            text: 'Weight (lbs)',
            draggable: false,
            width: 140,
            sortable: false,
            menuDisabled: true,
            align: 'left',
            dataIndex: 'weight'
        });


        if (!this.packageData) {
            columns.push({
                text: 'Method',
                xtype: 'templatecolumn',
                draggable: false,
                width: 115,
                sortable: false,
                menuDisabled: true,
                align: 'left',
                tpl: [
                '{fulfillmentMethod}',                
                '<tpl if="values.isPackagedStandAlone">',
                ' (Separately)',
                '</tpl>'                
                ],
                dataIndex: 'fulfillmentMethod'
            });
        }

        if (!this.packageData) {
            columns.push({
                text: 'Location',
                draggable: false,
                width: 100,
                sortable: false,
                menuDisabled: true,
                align: 'left',
                dataIndex: 'fulfillmentLocationCode'
            }, {
                text: 'Status',
                draggable: false,
                width: 100,
                sortable: false,
                menuDisabled: true,
                align: 'left',
                dataIndex: 'fulfillmentStatus'
            });
        }

        columns.push({
            text: 'Quantity',
            draggable: false,
            width: 100,
            sortable: false,
            menuDisabled: true,
            align: 'left',
            editor: {
                xtype: 'textfield',
                // highlights the cell when not editing
                showBorder: true,
                selectOnFocus: true,
                allowBlank: true,
                minValue: 0,
                maxValue: 100000
            },
            dataIndex: 'quantity'
        });

        return columns;
    },


    buildToolbar: function() {
        var cfg = {
            xtype: 'toolbar',
            dock: 'bottom',
            plain: true,
            padding: '10 0 0 0',
            enableOverflow: true,
            items: ['->'],
            style: {
                backgroundColor: 'transparent'
            }
        };

        if (!this.isShippedPackage || true) {
            cfg.items.push(this.buildMoveMenu());
        }

        this.bbar = cfg;
    },

    buildMoveMenu: function() {

        this.moveMenuAction = Ext.create('Ext.button.Button', {
            ui: 'action',
            scale: 'medium',
            margin: '0 2 0 0',
            text: 'Move to',

            listeners: {
                menushow: function(button, menu) {
                    menu.removeAll();
                    menu.add(this.buildMenuActions());
                },
                scope: this
            },
            menu: {
                plain: true,
                listeners: {
                    click: this.moveSelectedItems,
                    scope: this,
                    delegate: 'x-menu-item-link'
                },
                items: [{
                    text: 'temp'
                }]
            }
        });

        return this.moveMenuAction;
    },

    buildMenuActions: function() {
        var ret = [],
            unfulfilledPackages;

        if (!this.getUnfulfilledFieldName()) return ret;

        unfulfilledPackages = this.record.get(this.getUnfulfilledFieldName());

        ret.push({
            text: this.getMoveToNewText(),
            newPackage: true
        });

        Ext.each(unfulfilledPackages, function(unfulfilledPackage) {
            if (this.packageData && unfulfilledPackage.id === this.packageData.id) return;

            ret.push({
                text: unfulfilledPackage.code,
                packageData: unfulfilledPackage
            });
        }, this);

        return ret;
    },

    moveSelectedItems: function(menu, item) {
        Taco.app.viewPort.setLoading(true);

        this.record[item.newPackage ? this.getCreateAction() : this.getMoveAction()]({
            jsonData: {
                orderId: this.record.getId(),
                sourcePackageId: this.packageData ? this.packageData.id : null,
                destinationPackageId: item.newPackage ? null : item.packageData.id,
                items: this.getSelectedDataItems()
            },
            success: function(response) {
                var json = Ext.decode(response.responseText, true);
                
                if (!json || !json.success) Taco.app.fireEvent('setmessage', 'Error moving items', 'error');

                this.record.reload();
            },
            failure: function(response) {
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : 'Error moving items';

                Taco.app.fireEvent('setmessage', msg, 'error');
            },
            callback: function() {
                Taco.app.viewPort.setLoading(false);
            },
            scope: this
        });
    },

    getSelectedDataItems: function() {
        var ret = [];
        
        Ext.Array.each(this.getSelectionModel().getSelection(), function (element) {
            // ignore any items with no quantity;
            var dataItem = element.getData();
            if (dataItem && dataItem.quantity) {
                ret.push(element.getData());
            }            
        });

        return ret;
    }

});