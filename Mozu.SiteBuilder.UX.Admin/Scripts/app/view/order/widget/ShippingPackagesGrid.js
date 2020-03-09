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
        this.getQuantityForTransfer();

        this.store = Ext.create('Ext.data.JsonStore', {
            data: this.shipmentRecord.items,
            fields: [{
                name: 'productCode',
                type: 'string',
                useNull: false
            },
            {
                name: 'variationProductCode',
                type: 'string',
                useNull: true
            },
            {
                name: 'overridePrice',
                type: 'float',
                useNull: true,
                convert: function (value, record) {
                    if (value > 0) {
                        this.hidden = false;
                    }
                }
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
            }, {
                name: 'overridePrice',
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
                name: 'lineItemCost',
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
            },
            {
                name: 'backorderReleaseDate',
                type: 'date',
                useNull: true,
                //dateFormat: 'c'
                },
                {
                    name: 'quantityAvailToTransfer',
                    type: 'int',
                    defaultValue: 0
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
                    var plugin = this;
                    plugin.editor.form.findField('itemTax').disable();
                    if (editor && !editor.record.get('overridePrice'))
                        editor.record.set('overridePrice', editor.record.get('actualPrice'));

                    if (me.shipmentRecord.shipmentType == "Transfer")
                        return false;

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
        var discount = 0;
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
                flex: 2,
                renderer: function (value, metadata, record) {
                    var attributes = "<span class='product-name'>" + record.data.name + "</span>";
                    for (var i = 0; i < record.data.options.length; i++) {
                        var display = Ext.util.Format.htmlEncode(record.data.options[i].shopperEnteredValue || record.data.options[i].value);
                        attributes += "<div class='option'>" + record.data.options[i].name + ": " + display + " (" + record.data.options[i].value + ")<div>";
                    }
                    return attributes;
                }
            },
            {
                dataIndex: 'overridePrice',
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
                renderer: function (value, metadata, record) {
                    var unitPrice = (record.get("overridePrice") !== undefined && record.get("overridePrice") !== null)
                        ? record.get("overridePrice")
                        : record.get("actualPrice");
                    return this.record.formatCurrency(unitPrice);
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
                text: 'Tax',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                minWidth: 80,
                flex: 1,
                editor: {
                    showBorder: false,
                    listeners: {
                        focus: function (field, event, eOpts) {
                            //me.editItemUnitTax(field, event, eOpts);
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
                dataIndex: 'itemDiscount',
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
                    discount = value
                    return this.record.formatCurrency(value)

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
                    return this.record.formatCurrency(value - discount);
                }
            },
            {
                dataIndex: 'backorderReleaseDate',
                text: 'Backorder Available Date',
                draggable: false,
                sortable: false,
                //resizable: false,
                align: 'center',
                menuDisabled: true,
                hidden: this.shipmentRecord.shipmentStatus.toLowerCase() != 'backorder',
                width: 200,
                flex: 2,
                renderer: function (value) {
                    if (value)
                        return Ext.Date.format(value, 'm/d/Y');
                }
            },
            {
                xtype: 'taco.menucolumn',
                stateId: 'actionsColumn',
                hidden: me.isShipmentAction(),
                menuItems: me.getShipmentLevelSplitMenu()
            }
        ];
        this.callParent();
    },

    isShipmentAction: function () {
        if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'fulfilled' || this.shipmentRecord.shipmentStatus.toLowerCase() == 'canceled')
            return true;
        return false;
    },

    isReassignBlocked: function () {
        return this.shipmentRecord.shipmentType == "STH" && !Taco.user.taContext.omsEnabled;
    },

    getShipmentLevelSplitMenu: function () {
        var me = this;
        var actionCancelItem = {
            text: 'Cancel Item',
            handler: function () {
                me.openItemCancellationPopup();
            }
        };

        var actionRequestTransfer = {
            text: 'Request Transfer',
            handler: function () {
                me.openItemRequestTransferPopup();
            },
            listeners: {
                beforerender: function (eOpts, a) {
                    if (parseInt(eOpts.eventData.record.get('quantityAvailToTransfer')) <= 0)
                        this.hide();
                }
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
            hidden: me.isReassignBlocked(),
            handler: function () {
                me.openItemsReassignPopup();
            }
        };

        var autoReassign = {
            text: 'Auto Reassign',
            hidden: this.shipmentRecord.shipmentType == "BOPIS" || me.isReassignBlocked(),
            handler: function () {
                me.shipmentItemAutoReassign();
            }
        };

        if (me.shipmentRecord.shipmentType == "Transfer") {
            return [
                manualReassign,
                autoReassign,
                actionCancelItem
            ];
        }
        else if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'ready') {
            return [
                manualReassign,
                autoReassign,
                //actionMoveToBackorder,
                actionEditItem,
                this.shipmentRecord.shipmentType == "BOPIS" ? actionRequestTransfer : null,
                actionCancelItem
            ];
        }
        else if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'backorder') {
            return [
                manualReassign,
                autoReassign,
                actionUpdateBackorderDate,
                actionEditItem,
                this.shipmentRecord.shipmentType == "BOPIS" ? actionRequestTransfer : null,
                actionCancelItem
            ];
        }
        else if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'customer_care') {
            return [
                manualReassign,
                autoReassign,
                //actionMoveToBackorder,
                actionEditItem,
                this.shipmentRecord.shipmentType == "BOPIS" ? actionRequestTransfer : null,
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
            items: []
        }

        if (me.shipmentRecord.location)
            model.locationBlacklist = [me.shipmentRecord.location.code];


        if (model && me.shipmentRecord.shipmentType == "BOPIS") {
            model.pickup = true;
        }
        else if (model && me.shipmentRecord.shipmentType == "STH") {
            model.directShip = true;
        }

        if (me.shipmentRecord.location && me.shipmentRecord.location.address) {
            model.requestLocation = {
                postalCode: me.shipmentRecord.location.address.postalOrZipCode,
                latitude: me.shipmentRecord.location.geo ? me.shipmentRecord.location.geo.lat : '',
                longitude: me.shipmentRecord.location.geo ? me.shipmentRecord.location.geo.lng : '',
                //locationCode: me.shipmentRecord.location.code,
                countryCode: me.shipmentRecord.location.address.countryCode
            }
            //only showing 500 miles radius locations for BOPIS
            if (model.requestLocation && me.shipmentRecord.shipmentType == "BOPIS") {
                model.requestLocation.radius = 500;
                model.requestLocation.unit = 'MILES';
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
                            var itemUnitTax = (Math.round(json.unitTax * 100) / 100) * selectedItem.quantity;
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

        var store = me.record.getCancellationReasons(me.shipmentRecord.shipmentType);
        store.load({
            scope: this,
            callback: function (records, operation, success) {
                if (records) {
                    var grid = Ext.getCmp(this.id);
                    var item = grid.getSelectionModel().getSelection();

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

    openItemRequestTransferPopup: function () {
        var me = this;
        var grid = Ext.getCmp(this.id);
        var item = grid.getSelectionModel().getSelection();
        Ext.create('Taco.view.order.modal.fulfillment.RequestItemTransfer', {
            layout: 'hbox',
            width: 400,
            height: 400,
            record: me.record,
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
                Taco.app.fireEvent('setmessage', "Item " + me.shipmentItemAutoReassignPayload.reassignItemsRequest.items[0].name + " Successfully Reassigned", 'success');
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
                reassignItemsRequest: {
                    items: [{
                        lineId: selectedItem.lineId,
                        name: selectedItem.name,
                        productCode: selectedItem.productCode,
                        quantity: selectedItem.quantity,
                        imageUrl: selectedItem.imageUrl,
                        actualPrice: selectedItem.actualPrice,
                        overridePrice: selectedItem.overridePrice,
                        optionAttributeFQN: selectedItem.optionAttributeFQN,
                        variationProductCode: selectedItem.variationProductCode
                    }]
                }
            };
        }
    },

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

    getQuantityForTransfer: function () {
        if (this.shipmentRecord.shipmentType == "BOPIS") {
            for (var i = 0; i < this.shipmentRecord.items.length; i++) {
                if (this.shipmentRecord.transferShipmentNumbers && this.shipmentRecord.transferShipmentNumbers.length > 0) {
                    this.shipmentRecord.items[i].quantityAvailToTransfer = this.shipmentRecord.items[i].quantity - this.getActiveQuantityFromTransferShipments(this.shipmentRecord.transferShipmentNumbers, this.shipmentRecord.items[i].productCode);
                }
                else {
                    this.shipmentRecord.items[i].quantityAvailToTransfer = this.shipmentRecord.items[i].quantity;
                }
            }
        }
    },

    getActiveQuantityFromTransferShipments: function (transferShipments, productCode) {
        var quantity = 0;
        for (var shipmentCount = 0; shipmentCount < this.record.get('shipments').length; shipmentCount++) {
            for (var transferCount = 0; transferCount < transferShipments.length; transferCount++) {
                if (this.record.get('shipments')[shipmentCount].number == transferShipments[transferCount]) {
                    if (this.record.get('shipments')[shipmentCount].shipmentStatus.toLowerCase() != 'canceled') {
                        for (var itemCount = 0; itemCount < this.record.get('shipments')[shipmentCount].items.length; itemCount++) {
                            if (this.record.get('shipments')[shipmentCount].items[itemCount].productCode == productCode)
                                quantity += parseInt(this.record.get('shipments')[shipmentCount].items[itemCount].quantity);
                        }
                    }
                }
            }
        }
        return quantity;
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
                overridePrice: selectedItem.overridePrice
            }
        };
    },

    validateModal: function () {
        var grid = Ext.getCmp(this.id);
        var item = grid.getSelectionModel().getSelection();
        return item[0].dirty; // save if something changed
    }
});