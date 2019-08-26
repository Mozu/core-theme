Ext.define('Taco.view.order.widget.ShippingPackagesGrid', {
    extend: 'Ext.grid.Panel',
    requires: ['Ext.grid.CellEditor',
        'Ext.grid.RowEditor',
        'Ext.util.DelayedTask',
        'Ext.form.RadioManager',
        'Ext.selection.CellModel',
        'Ext.grid.*',
        'Ext.data.*',
        'Ext.util.*',
        'Ext.form.*'],

    title: '',
    itemId: 'ShippingPackagesGrid',
    xtype: 'row-editing',

    viewConfig: {
        deferEmptyText: false,
        emptyText: "No items available",
    },

    selType: 'rowmodel',

    plugins: [],

    cls: 'shipping-packages-grid',

    allSelected: false,

    initEvents: function () {
        var me = this;
        me.initEditTriggers();
    },

    initEditTriggers: function () {
        var me = this,
            view = me.view;

        // Listen for the edit trigger event.
        if (me.triggerEvent == 'cellfocus') {
            me.mon(view, 'cellfocus', me.onCellFocus, me);
        } else if (me.triggerEvent == 'rowfocus') {
            me.mon(view, 'rowfocus', me.onRowFocus, me);
        } else {

            // Prevent the View from processing when the SelectionModel focuses.
            // This is because the SelectionModel processes the mousedown event, and
            // focusing causes a scroll which means that the subsequent mouseup might
            // take place at a different document XY position, and will therefore
            // not trigger a click.
            // This Editor must call the View's focusCell method directly when we recieve a request to edit
            if (view.getSelectionModel().isCellModel) {
                view.onCellFocus = Ext.Function.bind(me.beforeViewCellFocus, me);
            }

            // Listen for whichever click event we are configured to use
            me.mon(view, me.triggerEvent || ('cell' + (me.clicksToEdit === 1 ? 'click' : 'dblclick')), me.onCellClick, me);
        }

        // add/remove header event listeners need to be added immediately because
        // columns can be added/removed before render
        //me.initAddRemoveHeaderEvents()
        // wait until render to initialize keynav events since they are attached to an element
        //view.on('render', me.initKeyNavHeaderEvents, me, { single: true });
    },

    initComponent: function () {
        var me = this;
        
        me.setIsRefreshShippingEnabled();
        this.store = Ext.create('Ext.data.JsonStore', {
            data: this.shipmentRecord.items,
            fields: [{
                name: 'productCode',
                type: 'string',
                useNull: false
            },
            {
                name: 'name',
                type: 'string',
                useNull: true
            }, {
                name: 'quantity',
                type: 'int',
                useNull: true
            }, {
                name: 'actualPrice',
                type: 'float',
                useNull: true
            },
            {
                name: 'itemTax',
                type: 'float',
                useNull: true
            },
            {
                name: 'discount',
                type: 'int',
                useNull: true
                },
                
                {
                    name:'lineItemCost',
                    type: 'float',
                    useNull:true
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
                name: 'options',
                type: 'auto',
                useNull: true
            }, {
                name: 'duty',
                type: 'float',
                useNull: true
            }, {
                name: 'handling',
                type: 'float',
                useNull: true
            }, {
                name: 'handlingTax',
                type: 'float',
                useNull: true
            }, {
                name: 'handlingDiscount',
                type: 'float',
                useNull: true
            }, {
                name: 'isTaxable',
                type: 'float',
                useNull: true
            }, {
                name: 'itemDiscount',
                type: 'float',
                useNull: true
            }, {
                name: 'lineItemcost',
                type: 'float',
                useNull: true
            }, {
                name: 'shipping',
                type: 'float',
                useNull: true
            }, {
                name: 'shippingDiscount',
                type: 'float',
                useNull: true
            }, {
                name: 'shippingTax',
                type: 'float',
                useNull: true
            }, {
                name: 'weight',
                type: 'float',
                useNull: true
                }
                , {
                    name: 'imageUrl',
                    type: 'string',
                    useNull: true
                }
            ],
            sorters: [{
                sorterFn: function (a, b) {
                    if (a.get('lineId') === b.get('lineId')) {
                        return 0;
                    }
                    return (a.get('lineId') < b.get('lineId') ? -1 : 1);
                }
            }]
        });
        //var rowedit = Ext.create('Ext.grid.plugin.RowEditing', {
        //    pluginId: 'destinationEditor'
        //});
        this.plugins.push(
            Ext.create('Ext.grid.plugin.RowEditing', {
                clicksToEdit: 1,
                pluginId: 'destinationEditor',
                listeners: {
                    edit: function (editor, context, eOpts) {
                        me.doSave();
                    }
                },
                beforeEdit: function (editor, context, eOpts) {
                    if (me.shipmentRecord.shipmentStatus.toLowerCase() == 'ready'
                        || me.shipmentRecord.shipmentStatus.toLowerCase() == 'backorder'
                        || me.shipmentRecord.shipmentStatus.toLowerCase() == 'customer_care') {
                        return true;
                    }
                    else {
                        return false;
                    }
                },

            }));


        //this.selModel = Ext.create('Ext.selection.CheckboxModel', {
        //    selType: 'checkboxmodel',
        //    mode: 'single',
        //    injectCheckbox: 'first',
        //    headerWidth: 37,
        //    checkOnly: false,
        //    showHeaderCheckbox: false,
        //});

        //this.columns = this.getColumnConfig(me);

        this.columns = [
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
                dataIndex: 'imageUrl',
                draggable: false,
                resizable: true,
                menuDisabled: true,
                hidden: false,
                renderer: function (value) {
                    if (value)
                        return '<img src="' + value + '" style="width:60px" />';
                    else
                        return '';
                }
            },
            {
                dataIndex: 'name',
                text: 'Name',
                draggable: false,
                sortable: false,
                resizable: true,
                menuDisabled: false,
                minWidth: 100,
                flex: 2
            },
            {
                dataIndex: 'options',
                text: 'Item Attributes',
                draggable: false,
                sortable: false,
                resizable: true,
                menuDisabled: false,
                minWidth: 100,
                flex: 2,
                renderer: function (optionValue) {
                    for (i = 0; i < optionValue.length; i++) {
                        var display = Ext.util.Format.htmlEncode(optionValue[i].shopperEnteredValue || optionValue[i].value);
                        return "<div class='option'>" + optionValue[i].name + ": " + display + " (" + optionValue[i].value + ")<div><br/>";
                    }
                }
            },
            {
                dataIndex: 'actualPrice',
                text: 'Unit Price',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                editor: {
                    xtype: 'numberfield',
                    showBorder: false,
                    hideTrigger: true,
                    minValue: 0,

                },
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
                flex: 1,
            },
            {
                dataIndex: 'itemTax',
                text: 'Item Tax',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                hidden: me.isRefreshShippingEnabled,
                editor: {
                    showBorder: false,
                    listeners: {
                        focus: function (field, event, eOpts) {
                            me.editItemUnitTax(field, event, eOpts);
                        }
                    }
                },
                renderer: function (value) {
                    return this.record.formatCurrency(value);
                }
            },
            //{
            //    dataIndex: 'quantity',
            //    text: 'Avail Qty',
            //    draggable: false,
            //    sortable: false,
            //    //resizable: false,
            //    align: 'center',
            //    menuDisabled: true,
            //    minWidth: 80,
            //    flex: 1,
            //},
            {
                dataIndex: 'discount',
                text: 'Discount',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                //editor: {
                //    xtype: 'numberfield',
                //    showBorder: false,
                //    hideTrigger: true,
                //    minValue: 0,
                //},
                renderer: function (value) {
                    return this.record.formatCurrency(value);
                }
            },
            {
                dataIndex: 'lineItemCost',
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
                hidden: me.isShipmentAction(),
                menuItems: me.getShipmentLevelSplitMenu(),
            }
        ];
        this.callParent();
    },

    setIsRefreshShippingEnabled: function () {
        this.isRefreshShippingEnabled = false

        if (this.record.SiteShipSetting.data) {
            return this.isRefreshShippingEnabled = this.record.SiteShipSetting.data.refreshTax || false;
        }
    },

    isShipmentAction: function () {
        if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'fulfilled' || this.shipmentRecord.shipmentStatus.toLowerCase() == 'canceled')
            return true;
        return false;
    },

    getShipmentLevelSplitMenu: function () {
        var me = this;
        var actionCancelItem = {
            text: 'Cancel Item',
            handler: function () {
                me.openItemCancellationPopup();
            }
        };

        var actionUpdateBackorderDate = {
            text: 'Update Backorder Date',
            handler: function () {
                me.openUpdateBackorderDatePopUp();
            }
        };

        var actionEditItem = {
            text: 'Edit Item',
            handler: function () {
                me.editShipmentItem();
            }
        };

        var manualReassign = {
            text: 'Manual Reassign',
            handler: function () {
                me.openItemsReassignPopup();
            }
        };

        var autoReassign = {
            text: 'Auto Reassign',
            hidden: this.shipmentRecord.shipmentType == "BOPIS",
            handler: function () {
                me.shipmentItemAutoReassign();
            }
        };

        if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'ready') {
            return [
                manualReassign,
                autoReassign,
                //actionMoveToBackorder,
                actionEditItem,
                actionCancelItem
            ];
        }
        else if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'backorder') {
            return [
                manualReassign,
                autoReassign,
                actionUpdateBackorderDate,
                actionEditItem,
                actionCancelItem
            ];
        }
        else if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'customer_care') {
            return [
                manualReassign,
                autoReassign,
                //actionMoveToBackorder,
                actionEditItem,
                actionCancelItem
            ];
        }
    },

    openItemsReassignPopup: function () {
        var me = this;
        var grid = Ext.getCmp(this.id);
        var item = grid.getSelectionModel().getSelection();        
        var selectedItem = item[0].data;
        if (selectedItem) {
            me.record.getInventory({
                jsonData: me.getReassignItemPayload(),
                success: function (response) {
                    me.isRecordSaved = true;
                    me.setLoading(false, me.body);
                    var json = Ext.decode(response.responseText, true);
                    Ext.create('Taco.view.order.modal.fulfillment.ItemsReassign', {
                        layout: 'hbox',
                        width: 1080,
                        height: 450,
                        record: me.record,
                        inventoryItemList: json,
                        //shipmentData: shipment,
                        shipmentRecord: me.shipmentRecord,
                        selectedItem: item[0].data,
                        //available: json.items.candidateSuggestions.length > 0 ? json.candidateSuggestions[0].inventory[0].available : '',
                        listeners: {
                            saveSuccess: {
                                fn: function (json) {
                                    me.fireEvent('shipmentReassign');
                                },
                                //scope: me
                            }
                        }
                    });
                },
                failure: function (response) {
                    me.setLoading(false, me.body);
                    // close the dialog
                    //me.close();
                }
            });
        }
    },

    getReassignItemPayload: function () {
        var me = this;
        //var shipment = me.shipmentRecord;
        var grid = Ext.getCmp(this.id);
        var item = grid.getSelectionModel().getSelection();

        var model = {
            type: me.shipmentRecord.shipmentType == "BOPIS" ? 'ALL' : 'ANY',
            locationBlacklist: [me.shipmentRecord.location.code ],
            items: []
        }

        if (model && me.shipmentRecord.shipmentType == "BOPIS") {
            model.pickup = true;
        }
        else
            model.pickup = false;

        if (me.shipmentRecord.location && me.shipmentRecord.location.address) {
            model.requestLocation = {
                postalCode: me.shipmentRecord.location.address.postalOrZipCode,
                latitude: me.shipmentRecord.location.geo ? me.shipmentRecord.location.geo.lat : '',
                longitude: me.shipmentRecord.location.geo ? me.shipmentRecord.location.geo.lng : '',
                //locationCode: me.shipmentRecord.location.code,
                radius: 500,
                unit: 'MILES',
                countryCode: 'US'
            }
        }

        if (item && item[0].data) {
            model.items.push({
                //partNumber: item[0].data.productCode,
                upc: item[0].data.variationProductCode ? item[0].data.variationProductCode : item[0].data.productCode,//write condition if variationproduct code missing
                quantity: item[0].data.quantity
            });
        }
        return model;
    },

    editShipmentItem: function () {
        var grid = Ext.getCmp(this.id);
        var item = grid.getSelectionModel().getSelection();

        grid.getPlugin('destinationEditor').startEdit(grid.store.getAt(item[0].index), grid.columns[item[0].index])
        // grid.getPlugin('destinationEditor').startEdit(grid.JsonStore.getAt(0), grid.columns[0])
        //Ext.getCmp(this.id);
        //Ext.getCmp(this.id).plugins.push(
        //    Ext.create('Ext.grid.plugin.RowEditing', {
        //        clicksToEdit: 1,
        //        pluginId: 'editing',
        //    }));
        Ext.getCmp(this.id).view.refresh();
    },

    editItemUnitTax: function (field, event, eOpts) {

        var me = this;
        me.taxFieldId = field.id;

        var grid = Ext.getCmp(this.id);
        var item = grid.getSelectionModel().getSelection();
        var selectedItem = item[0].data;

        if (selectedItem) {
            //field = e.context.field;
            Ext.create('Taco.view.order.modal.fulfillment.ItemUnitTax', {
                layout: 'hbox',
                width: 270,
                height: 200,
                selectedItem: selectedItem,
                listeners: {
                    udpateTax: {
                        fn: function (json) {
                            var itemUnitTax = Math.round(json.unitTax * 100) / 100;
                            Ext.getCmp(this.taxFieldId).setValue(itemUnitTax);
                        },
                        scope: me
                    }
                }
            });
        }
    },

    openItemCancellationPopup: function () {
        var me = this;

        var store = me.record.getCancellationReasons();
        store.load({
            scope: this,
            callback: function (records, operation, success) {
                if (records) {
                    var grid = Ext.getCmp(this.id);
                    var item = grid.getSelectionModel().getSelection();

                    for (var i = 0; i < records.length; i++) {
                        me.record.localeStore.each(function (localeRecord) {
                            if (records[i].get('reasonCode') == localeRecord.get('key')) {
                                records[i].dirty = true;
                                records[i].set('description', localeRecord.get('value'));
                                records[i].setDirty('description', localeRecord.get('value'));
                                records[i].commit();
                            }
                        });
                    }
                    Ext.create('Taco.view.order.modal.fulfillment.ShipmentItemCancellation', {
                        layout: 'hbox',
                        width: 600,
                        height: 400,
                        record: me.record,
                        store: store,
                        shipmentRecord: me.shipmentRecord,
                        selectedItem: item[0].data,
                        listeners: {
                            saveSuccess: {
                                fn: function () {
                                    me.fireEvent('shipmentRefresh');
                                },
                                //scope: me
                            }
                        }
                    });
                }
            }
        });

    },

    shipmentItemAutoReassign: function (locationCode) {
        var me = this;

        me.setLoading(true, this.body);
        me.shipmentItemAutoReassignPayload = me.getShipmentItemReassignPayload();

        if (locationCode && me.shipmentItemAutoReassignPayload.shipmentItems[0])
            me.shipmentItemAutoReassignPayload.shipmentItems[0].fulfillmentLocationCode = locationCode;

        this.record.reassignShipmentItems({
            jsonData: me.shipmentItemAutoReassignPayload,
            success: function (response) {
                me.setLoading(false, this.body);
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', 'Error while assigning shipment item', 'error');
                    return;
                }
                Taco.app.fireEvent('setmessage', "Item " + me.shipmentItemAutoReassignPayload.shipmentItems[0].name + " Successfully Reassigned", 'success');
                me.fireEvent('shipmentReassign');
            },
            failure: function (response) {
                me.setLoading(false, this.body);
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : 'Error while assigning shipment item';
                Taco.app.fireEvent('setmessage', msg, 'error');
            },
            scope: me
        });
    },

    getShipmentItemReassignPayload: function () {
        var me = this;
        var grid = Ext.getCmp(this.id);
        var item = grid.getSelectionModel().getSelection();
        var selectedItem = item[0].data;
        if (selectedItem) {
            return {
                shipmentNumber: me.shipmentRecord.number,
                shipmentItems: [{
                    lineId: selectedItem.lineId,
                    name: selectedItem.name,
                    productCode: selectedItem.productCode,
                    quantity: selectedItem.quantity,
                    imageUrl: selectedItem.imageUrl,
                    actualPrice: selectedItem.actualPrice,
                    optionAttributeFQN: selectedItem.optionAttributeFQN,
                    variationProductCode: selectedItem.variationProductCode
                }]
            };
        }
    }
});



    openUpdateBackorderDatePopUp: function () {
        var grid = Ext.getCmp(this.id);
        var item = grid.getSelectionModel().getSelection();
        var selectedItem = item[0].data;
        if (selectedItem) {
            var me = this;
            Ext.create('Taco.view.order.modal.fulfillment.UpdateBackorderDate', {
                layout: 'hbox',
                width: 350,
                height: 300,
                shipmentRecord: me.shipmentRecord,
                record: me.record,
                isShipment: false,
                selectedItem: selectedItem,
                listeners: {
                    dateUpdated: {
                        fn: function (json) {
                            me.fireEvent('shipmentRefresh', json);
                        },
                        scope: me
                    }
                }
            });
        }
    },

    doSave: function () {

        if (this.validateModal()) {

            var me = this;
            me.setLoading(true, this.body);
            var payloadData = me.getPayloadItemUpdate();

            this.record.updateShipmentItem({
                jsonData: payloadData,
                success: function (response) {
                    me.isRecordSaved = true;
                    me.setLoading(false, me.body);
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        Taco.app.fireEvent('setmessage', json.response, 'error');
                        return;
                    }
                    Taco.app.fireEvent('setmessage', "Item " + " updated successfully", 'success');
                    me.fireEvent('shipmentReassign');
                    // close the dialog

                },
                failure: function (response) {
                    me.setLoading(false, me.body);

                    var json = Ext.decode(response.responseText, true),
                        msg = (json && json.message) ? json.message : 'Error deallocating inventory';
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    //me.close();
                }
            });
        }
    },

    getPayloadItemUpdate: function () {
        var me = this;
        var grid = Ext.getCmp(this.id);
        var item = grid.getSelectionModel().getSelection();
        var selectedItem = item[0].data;
        return {
            orderId: me.shipmentRecord.orderId,
            shipmentNumber: me.shipmentRecord.number,
            itemId: selectedItem.lineId, //selectedItem.lineId,
            shipmentItemAdjustment: {
                actualPrice: selectedItem.actualPrice,
                unitTax: selectedItem.itemTax,
            }
        }
    },

    validateModal: function () {
        var me = this;
        var grid = Ext.getCmp(this.id);
        var item = grid.getSelectionModel().getSelection();
        var selectedItem = item[0].data;
        if (selectedItem.actualPrice == item[0].raw.actualPrice && selectedItem.itemTax == item[0].raw.itemTax) {
            return false;
        }
        return true;
    }
});