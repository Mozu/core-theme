
Ext.define('Taco.view.order.widget.ShippingPackagesGrid', {
    extend: 'Ext.grid.Panel',

    title: '',

    viewConfig: {
        deferEmptyText: false,
        emptyText: "No items available"
    },

    cls:'shipping-packages-grid',

    allSelected: false,

    initComponent: function () {

        this.store = Ext.create('Ext.data.JsonStore', {
            data: this.packageStore.items,
            fields: [{
                name: 'productCode',
                type: 'string',
                useNull: false
            },
            {
                name: 'productName',
                type: 'string',
                useNull: true
            }, {
                name: 'quantity',
                type: 'int',
                useNull: true
            }, {
                name: 'unitPrice',
                type: 'float',
                useNull: true
            },
            {
                name: 'total',
                type: 'float',
                useNull: true
            },
            {
                name: 'weight',
                type: 'float',
                defaultValue: 0
            }, {
                name: 'isPackagedStandAlone',
                type: 'boolean'
            }, {
                name: 'lineId',
                type: 'int',
                unseNull: false
            }, {
                name: 'fulfillmentStatus',
                type: 'string',
                useNull: true
            }, {
                name: 'optionAttributeFQN',
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

        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            injectCheckbox: 'first',
            headerWidth: 37,
            checkOnly: true,
            showHeaderCheckbox: true,
            setup: function () {
                this.maxSelections = 0;
                //var selections = this.store.getRange();

                //for (var key in selections) {
                //    if (selections[key].data.quantityReturnable !== 0) {
                //        this.maxSelections++;
                //    }
                //}

                //this.isSetup = true;
            },

            setHeader: function (header) {
                this.checkallBox = header;
            },

            //setErrorEl: function (el) {
            //    this.errorEl = el;
            //},

            checkSelected: function () {
                //if (!this.isSetup) this.setup();

                //if (this.getSelection().length === this.maxSelections && this.maxSelections !== 0) {
                //    this.allSelected = true;
                //    this.checkallBox.el.addCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');

                //    var me = this;
                //    setTimeout(function () {
                //        if (me.getSelection().length === 0) return;
                //        me.checkallBox.el.addCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');
                //    }, 100);
                //} else {
                //    this.allSelected = false;
                //    this.checkallBox.el.removeCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');
                //}
            },

            selectAll: function (suppressEvent, header) {
                if (!this.allSelected) {
                    this.allSelected = true;
                    //var selections = this.store.getRange();
                    //var returnableItems = [];

                    //for (var key in selections) {
                    //    if (selections[key].data.quantityReturnable !== 0) {
                    //        returnableItems.push(selections[key]);
                    //    }
                    //}

                    //var len = returnableItems.length;
                    //for (var i = 0; i < len; i++) {
                    //    this.doSelect(returnableItems[i], true, suppressEvent);

                    //    var unreturned = returnableItems[i].get('quantityFulfilled') - returnableItems[i].get('quantityReturned');

                    //    if (!returnableItems[i].get('quantity') && unreturned > 0) {
                    //        returnableItems[i].set('quantity', 1);
                    //    }
                    //}

                    //if (this.getSelection().length !== 0) {
                    //    header.el.addCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');
                    //} else {
                    //    this.errorEl.setError('All items have already been returned');
                    //    this.allSelected = false;
                    //    return;
                    //}
                } else {
                    this.allSelected = false;
                    this.deselectAll(suppressEvent);
                }

                this.errorEl.setError('');
            },

            onHeaderClick: function (headerCt, header, e) {
                //if (!header.isCheckerHd) {
                //    return;
                //}

                //e.stopEvent();
                //this.selectAll(true, header);
            },

            listeners: {
                //deselect: function (grid, record) {
                //    this.checkSelected();
                //    this.errorEl.setError('');
                //},

                //select: function (grid, record) {
                //    this.checkSelected();
                //    this.errorEl.setError('');
                //}
            },

            renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
                var baseCSSPrefix = Ext.baseCSSPrefix;
                metaData.tdCls = baseCSSPrefix + 'grid-cell-special ' + baseCSSPrefix + 'grid-cell-row-checker';
                return record.get('quantityReturnable') === 0 ? '<div class="' + baseCSSPrefix + 'grid-row-checker disabled-return-checkbox"> </div>' : '<div class="' + baseCSSPrefix + 'grid-row-checker"> </div>';
            }
        });

        this.columns = this.getColumnConfig();

        this.callParent();
        
        // Loading should be kicked off by the parent Return subform.
        //this.loadReturnableItemsData();
    },
    
    getColumnConfig: function () {
        return [
            {
                dataIndex: 'lineId',
                text: 'Line',
                draggable: false,
                resizable: true,
                width: 60,
                sortable: false,
                menuDisabled: true,
                hidden: false
            },
            {
                text: 'Image',
                draggable: false,
                resizable: true,
                menuDisabled: true,
                hidden: false,
                renderer: function (value) {
                    return '<img src="http://dtlr258s62w81.cloudfront.net/19638-23793/cms/23793/files/6ac0c98f-402d-4fd2-95da-a482f3520041?max=160&_mzcb=_1486049853491" style="width:60px" />';
                }
            },
            {
                dataIndex: 'productName',
                text: 'Name',
                draggable: false,
                sortable: false,
                resizable: true,
                menuDisabled: false,
                minWidth: 100,
                flex: 2
            },
            {
                dataIndex: 'optionAttributeFQN',
                text: 'Item Attributes',
                draggable: false,
                sortable: false,
                resizable: true,
                menuDisabled: false,
                minWidth: 100,
                flex: 2
            },
            {
                dataIndex: 'unitPrice',
                text: 'Unit Price',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                renderer: function (value) {
                    return this.record.formatCurrency(value);
                }
            },
            {
                dataIndex: 'unitPrice',
                text: 'Unit Tax',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                renderer: function (value) {
                    return this.record.formatCurrency(value);
                }
            },
            {
                dataIndex: 'quantity',
                text: 'Qty',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1
            },
            {
                dataIndex: 'quantity',
                text: 'Avail Qty',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1
            },
            {
                dataIndex: 'total',
                text: 'Subtotal',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                renderer: function (value) {
                    return this.record.formatCurrency(value);
                }
            },
            {
                xtype: 'taco.menucolumn',
                stateId: 'actionsColumn',
                menuItems: [
                    {
                        text: 'Edit Item',
                        requiredBehaviors: {
                            model: 'Taco.model.Product',
                            behavior: 'update'
                        },
                        menuColumnHandler: function (item, eventData) {

                        }
                    },
                    {
                        text: 'Cancel Item',
                        requiredBehaviors: {
                            model: 'Taco.model.Product',
                            behavior: 'update'
                        },
                        menuColumnHandler: function (item, eventData) {

                        }
                    },
                    {
                        text: 'Reassign Item',
                        requiredBehaviors: {
                            model: 'Taco.model.Product',
                            behavior: 'update'
                        },
                        menuColumnHandler: function (item, eventData) {

                        }
                    }
                ]
            }
        ];
    }

});
