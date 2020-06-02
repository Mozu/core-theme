Ext.define('Taco.view.order.subform.fulfillment.Shipment', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    alias: 'widget.taco-order-fulfillment-shipments',
    requires: [
        'Taco.view.order.subform.fulfillment.ShipmentDetails',
        'Taco.store.Locations',
        'Taco.view.order.modal.fulfillment.UpdateBackorderDate'
    ],
    packageContainer: {},
    partialPickupItems: {},

    initComponent: function () {
        this.items = [];
        this.currentTaskList = this.getActiveTaskList();
        this.buildShipmentInfoHeader();

        this.callParent(arguments);
    },

    buildShipmentInfoHeader: function () {
        var me = this;

        var lastUpdated = this.shipmentRecord.fulfillmentDate ? Ext.Date.format(new Date(this.shipmentRecord.fulfillmentDate), 'm/d/y H:i:s') :
            (this.shipmentRecord.workflowState && this.shipmentRecord.workflowState.auditInfo ? Ext.Date.format(new Date(this.shipmentRecord.workflowState.auditInfo.updateDate), 'm/d/y H:i:s') : '');

        var shipmentTypeDescription = "";
        if (this.shipmentRecord.shipmentType) {
            if (this.shipmentRecord.shipmentType == "STH")
                shipmentTypeDescription = Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.ship_to_home;
            else if (this.shipmentRecord.shipmentType == "BOPIS")
                shipmentTypeDescription = Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.store_pickup;
            else if (this.shipmentRecord.shipmentType == "Transfer")
                shipmentTypeDescription = Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.transfer;
        }

        this.infoContainer = Ext.widget({
            xtype: 'container',
            cls: 'taco-order-fulfillment-shipments',
            padding: '20 20 25 20',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            defaults: {
                xtype: 'component',
                data: this.record.getData()
            },
            items:
                [
                    {
                        cls:'taco-shipment-item-header',
                        tpl: [
                            '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.GridHeader.type + '</span>',
                            '<div class="labelvalue">' + shipmentTypeDescription + '</div>'
                        ]
                    },
                    {
                        cls: 'taco-shipment-item-header',
                        tpl: [
                            '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.GridHeader.shipment +'</span>',
                            '<div class="labelvalue">' + this.shipmentRecord.number + '</div>'
                        ]
                    },
                    {
                        cls: 'taco-shipment-item-header',
                        hidden: this.shipmentRecord.shipmentType != "Transfer",
                        tpl: [
                            '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.GridHeader.parent_shipment_no + '</span>',
                            '<div class="labelvalue">' + this.shipmentRecord.originalShipmentNumber + '</div>'
                        ]
                    },
                    {
                        cls: 'taco-shipment-item-header',
                        hidden: this.shipmentRecord.shipmentStatus.toLowerCase() == 'backorder',
                        tpl: [
                            '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.GridHeader.last_updated + '</span>',
                            '<div class="labelvalue">' + lastUpdated + '</div>'
                        ]
                    },
                    {
                        cls: 'taco-shipment-item-header',
                        tpl: [
                            '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.GridHeader.status + '</span>',
                            '<div class="statusdiv x-column-content-pill x-column-content-pill-false">' + Taco.core.util.Common.camelToSpace(this.shipmentRecord.shipmentStatus) + '</div>'
                        ]
                    },
                    {
                        cls: 'taco-shipment-item-header',
                        hidden: !(this.shipmentRecord.shipmentStatus.toLowerCase() == 'customer_care' || this.shipmentRecord.shipmentStatus.toLowerCase() == 'canceled'),
                        tpl: [
                            '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.GridHeader.reason +'</span>',
                            '<div class="shipmentStatus">' +
                            (this.shipmentRecord.shipmentStatusReason ? this.getReasonDescription(this.shipmentRecord.shipmentStatusReason) : '')
                            + '</div>'
                        ],
                        width: 200
                    },
                    {
                        cls: 'taco-shipment-item-header',
                        hidden: this.shipmentRecord.shipmentStatus.toLowerCase() == 'backorder',
                        tpl: [
                            '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.GridHeader.shipment_step_id + '</span>',
                            '<div class="labelvalue">' + (this.currentTaskList ? this.currentTaskList.taskId : '') + '</div>'
                        ]
                    },
                    {
                        cls: 'taco-shipment-item-header',
                        hidden: this.shipmentRecord.shipmentStatus.toLowerCase() == 'backorder',
                        tpl: [
                            '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.GridHeader.fulfillment_step + '</span>',
                            '<div class="labelvalue">' + (this.currentTaskList ? this.currentTaskList.name : '') + '</div>'
                        ]
                    },
                    {
                        cls: 'taco-shipment-item-header',
                        tpl: [
                            '<span class="label">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.GridHeader.total +'</span>',
                            '<div class="labelvalue">' + this.record.formatCurrency(this.shipmentRecord.total) + '</div>'
                        ]
                    },
                    {
                        flex: 1,
                        html: '',
                    },
                    {
                        xtype: 'container',
                        cls: 'taco-shipment-item-header',
                        items: [
                            Ext.widget('splitbutton', {
                                menuAlign: 'tr-br?',
                                text: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ActionsColumn.reassign_shipment,
                                itemId: 'reassignShipmentSplitButton',
                                hidden: me.isShipmentAction() || me.isReassignBlocked() || me.restrictFulfiller(),
                                menu: [
                                    {
                                        text: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ActionsColumn.manual_reassign,
                                        handler: function () {
                                            me.openManualReassignShipmentModal();
                                        }
                                    },
                                    {
                                        text: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ActionsColumn.auto_reassign,
                                        hidden: this.shipmentRecord.shipmentType == "BOPIS",
                                        handler: function () {
                                            me.shipmentAutoReassign();
                                        }
                                    }
                                ],

                                ui: 'action',
                                scale: 'medium',
                                margin: '0 2px 0 0'
                            })
                        ]
                    },
                    {
                        xtype: 'container',
                        padding: '0 0 0 0',
                        items: [
                            Ext.widget('splitbutton', {
                                menuAlign: 'tr-br?',
                                text: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ActionsColumn.update_shipment,
                                itemId: 'updateShipmentSplitButton',
                                handler: function () {

                                },
                                hidden: me.isShipmentAction() || me.restrictFulfiller(),
                                menu: me.getShipmentLevelSplitMenu(),
                                ui: 'action',
                                scale: 'medium',
                                margin: '0 2px 0 0'
                            })
                        ]
                    }
                ]
        });

        this.items.push(this.infoContainer);
        this.ShipmentDetails = Ext.create('Taco.view.order.subform.fulfillment.ShipmentDetails', {
            record: this.record,
            shipmentRecord: this.shipmentRecord,
            listeners: {
                shipmentRefresh: function () {
                    me.fireEvent('shipmentRefresh');
                },
                partialPickup: function (partialPickupItems) {
                    if (partialPickupItems && partialPickupItems.pickupItemsRequest.items && partialPickupItems.pickupItemsRequest.items.length > 0) {
                        for (var count = 0; count < partialPickupItems.pickupItemsRequest.items.length; count++) {
                            if (!partialPickupItems.pickupItemsRequest.items[count].isValid) {
                                Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.enter_valid_qty_for_pickup, 'error');
                                return;
                            }
                        }
                        me.partialPickupItems = partialPickupItems;
                    }
                }
            }
        });
        this.items.push(this.ShipmentDetails);
    },

    savePartialPickup: function () {
        //Save
        var me = this;
        me.setLoading(true);
        this.record.pickupItems({
            jsonData: me.partialPickupItems,
            success: function (response) {
                me.setLoading(false);
                var json = Ext.decode(response.responseText, true);

                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', json.response, 'error');
                    return;
                }
                Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.pickup_successful, 'success');
                me.fireEvent('shipmentRefresh');
            },
            failure: function (response) {
                me.setLoading(false);
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_while_pickup;
                Taco.app.fireEvent('setmessage', msg, 'error');
            }
        });
    },

    shipmentAutoReassign: function (locationCode) {
        var me = this;

        me.setLoading(true, this.body);

        var payloadData = {
            shipmentNumber: this.shipmentRecord.number,
            reassignShipment: {
                attributes: {

                }
            }
        };
        if (locationCode)
            payloadData.reassignShipment.fulfillmentLocationCode = locationCode;

        this.record.reassignShipment({
            jsonData: payloadData,
            success: function (response) {
                me.setLoading(false, this.body);
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_while_assigning_shipment, 'error');
                    return;
                }
                Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.shipment + " " + me.shipmentRecord.number + " " + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.successfully_reassigned, 'success');
                me.fireEvent('shipmentRefresh', json);
            },
            failure: function (response) {
                me.setLoading(false, this.body);
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_while_assigning_shipment;
                Taco.app.fireEvent('setmessage', msg, 'error');
            },
            scope: me
        });
    },

    shipmentMarkAsShipped: function () {
        var me = this;
        me.setLoading(true, this.body);
        var payloadData = {
            shipmentNumber: this.shipmentRecord.number
        };

        this.record.fulfillShipment({
            jsonData: payloadData,
            success: function (response) {
                me.setLoading(false, this.body);
                if (response.status != 200) {
                    Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_while_fulfilling_shipment, 'error');
                    return;
                }
                me.fireEvent('shipmentRefresh');
            },
            failure: function (response) {
                me.setLoading(false, this.body);
                // error handling here
                Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_while_fulfilling_shipment, 'error');
            },
            scope: me
        });
    },

    shipmentMarkAsReceiveTransfer: function () {
        var me = this;
        me.setLoading(true, this.body);

        var payloadData = {
            shipmentNumber: this.shipmentRecord.number
        };
        this.record.receiveTransfer({
            jsonData: payloadData,
            success: function (response) {
                me.setLoading(false, this.body);
                if (response.status != 200) {
                    Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_while_receiving_transfer_shipment, 'error');
                    return;
                }
                me.fireEvent('shipmentRefresh');
            },
            failure: function (response) {
                me.setLoading(false, this.body);
                // error handling here
                Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_while_receiving_transfer_shipment, 'error');
            },
            scope: me
        });
    },

    shipmentMoveToBackorder: function () {
        var me = this;
        me.setLoading(true, this.body);
        var payloadData = {
            shipmentNumber: this.shipmentRecord.number
        };

        this.record.backorderedShipment({
            jsonData: payloadData,
            success: function (response) {
                me.setLoading(false, this.body);
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_while_moving_shipment_to_backorder, 'error');
                    return;
                }
                me.fireEvent('shipmentRefresh');
            },
            failure: function (response) {
                me.setLoading(false, this.body);
                // error handling here
                Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_while_moving_shipment_to_backorder, 'error');
            },
            scope: me
        });
    },

    getShipmentLevelSplitMenu: function () {
        var me = this;
        var actionCancelShipment = {
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ActionsColumn.cancel_shipment,
            handler: function () {
                me.openShipmentCancellationPopUp();
            }
        };

        var actionMarkAsShipped = {
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ActionsColumn.mark_as_shipped,
            hidden: this.shipmentRecord.shipmentType.toLowerCase() == 'transfer',
            handler: function () {
                me.shipmentMarkAsShipped();
            }
        };

        var shipmentMarkAsReceiveTransfer = {
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ActionsColumn.receive_transfer,
            handler: function () {
                me.shipmentMarkAsReceiveTransfer();
            }
        };

        //var actionMoveToBackorder = {
        //    text: 'Move To backorder',
        //    handler: function () {
        //        me.openUpdateBackorderDatePopUp();
        //    }
        //};

        var actionUpdateBackorderDate = {
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ActionsColumn.update_backorder_date,
            handler: function () {
                me.openUpdateBackorderDatePopUp();
            }
        };

        var splitMenus = [];
        var actionPickup = {
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.ActionsColumn.pickup,
            handler: function () {
                me.savePartialPickup();
            }
        };

        if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'ready') {
            splitMenus = [
                actionMarkAsShipped,
                actionCancelShipment,
                me.shipmentRecord.shipmentType == "BOPIS" ? actionPickup : null
            ];
        }
        else if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'backorder') {
            splitMenus = [
                actionUpdateBackorderDate,
                actionCancelShipment
            ];
        }
        else if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'customer_care') {
            splitMenus = [
                actionMarkAsShipped,
                actionCancelShipment
            ];
        }

        if (this.shipmentRecord.shipmentType.toLowerCase() == 'transfer' && this.shipmentRecord.workflowState.shipmentState.toLowerCase() == 'validate_incoming_transfer') {
            splitMenus.push(shipmentMarkAsReceiveTransfer);
        }
        return splitMenus;
    },

    isShipmentAction: function () {
        if (this.shipmentRecord.shipmentStatus.toLowerCase() == 'fulfilled' || this.shipmentRecord.shipmentStatus.toLowerCase() == 'canceled')
            return true;
        return false;
    },

    isReassignBlocked: function () {
        return this.shipmentRecord.shipmentType == "STH" && !Taco.user.taContext.omsEnabled;
    },
    restrictFulfiller: function () {
        if (this.shipmentRecord.shipmentType !== "Transfer" || this.shipmentRecord.workflowState.shipmentState ==  "VALIDATE_INCOMING_TRANSFER")
            return false;

        var restrictFulfiller = Taco.user.isFulfillerUser && !(Taco.user.locations.length == 0 || Taco.user.locations.includes(this.shipmentRecord.fulfillmentLocationCode))

        return restrictFulfiller;
    },

    openShipmentCancellationPopUp: function () {
        var me = this;

        var store = me.record.getCancellationReasons(me.shipmentRecord.shipmentType);
        store.load({
            scope: this,
            callback: function (records, operation, success) {
                if (records) {
                    Ext.create('Taco.view.order.modal.fulfillment.ShipmentCancellation', {
                        layout: 'hbox',
                        width: 600,
                        height: 400,
                        record: me.record,
                        shipmentRecord: me.shipmentRecord,
                        store: store,
                        listeners: {
                            shipmentCancelled: {
                                fn: function () {
                                    me.fireEvent('shipmentRefresh');
                                },
                                scope: me
                            }
                        }
                    });
                }
            }
        });
    },

    getReassignShipmentPayload: function () {
        var me = this;
        var shipment = me.shipmentRecord;
        var model = {
            orderType: 'DIRECTSHIP', //me.record.get('orderType'),
            items: [],
            inventoryRequestType: 'ALL'
        }

        if (model && shipment.fulfillmentLocationCode) {
            model.exclusionListLocationCode = [];
        }
        shipment.items.forEach(function (element) {
            model.items.push({
                upc: element.variationProductCode ? element.variationProductCode : element.productCode,
                quantity: element.quantity
            });

            if (model && shipment.fulfillmentLocationCode) {
                model.exclusionListLocationCode.push({
                    locationCode: shipment.fulfillmentLocationCode,
                    orderItemID: element.lineId
                });
            }
        });

        if (me.shipmentRecord.location && me.shipmentRecord.location.address) {
            model.shippingAddress = {
                postalCode: me.shipmentRecord.location.address.postalOrZipCode,
                countryCode: me.shipmentRecord.location.address.countryCode,
                latitude: me.shipmentRecord.location.geo ? me.shipmentRecord.location.geo.lat : '',
                longitude: me.shipmentRecord.location.geo ? me.shipmentRecord.location.geo.lng : '',
            }
        }

        return model;
    },

    getBopisReassignShipmentPayload: function () {
        var me = this;
        var shipment = me.shipmentRecord;
        var model = {
            type: 'ALL',
            pickup: true,
            items: []
        }

        if (me.shipmentRecord.location)
            model.locationBlacklist = [me.shipmentRecord.location.code];

        if (me.shipmentRecord.location && me.shipmentRecord.location.address) {
            model.requestLocation = {
                postalCode: me.shipmentRecord.location.address.postalOrZipCode,
                latitude: me.shipmentRecord.location.geo ? me.shipmentRecord.location.geo.lat : '',
                longitude: me.shipmentRecord.location.geo ? me.shipmentRecord.location.geo.lng : '',
                //locationCode: me.shipmentRecord.location.code,
                radius: 500,
                unit: 'MILES',
                countryCode: me.shipmentRecord.location.address.countryCode
            }
        }

        shipment.items.forEach(function (element) {
            model.items.push({
                upc: element.variationProductCode ? element.variationProductCode : element.productCode,
                quantity: element.quantity
            });
        });

        return model;
    },
   
    getReassignTransferShipmentPayload: function () {
        var me = this;
        var shipment = me.shipmentRecord;
        var model = {
            orderType: 'TRANSFER', //me.record.get('orderType'),
            items: [],
            inventoryRequestType: 'ALL'
        }

        if (model && shipment.fulfillmentLocationCode) {
            model.exclusionListLocationCode = [];
        }
        shipment.items.forEach(function (element) {
            model.items.push({
                upc: element.variationProductCode ? element.variationProductCode : element.productCode,
                quantity: element.quantity
            });

            if (model && shipment.fulfillmentLocationCode) {
                model.exclusionListLocationCode.push({
                    locationCode: shipment.fulfillmentLocationCode,
                    orderItemID: element.lineId
                });
            }
        });

        if (me.shipmentRecord.location && me.shipmentRecord.location.address) {
            model.shippingAddress = {
                postalCode: me.shipmentRecord.location.address.postalOrZipCode,
                countryCode: me.shipmentRecord.location.address.countryCode,
                latitude: me.shipmentRecord.location.geo ? me.shipmentRecord.location.geo.lat : '',
                longitude: me.shipmentRecord.location.geo ? me.shipmentRecord.location.geo.lng : '',
            }
        }

        return model;
    },

    openUpdateBackorderDatePopUp: function () {
        var me = this;
        Ext.create('Taco.view.order.modal.fulfillment.UpdateBackorderDate', {
            layout: 'hbox',
            width: 350,
            height: 300,
            shipmentRecord: me.shipmentRecord,
            isShipment: true, // this is denotes we are updating "backorder date" on all shipment
            record: me.record,
            listeners: {
                dateUpdated: {
                    fn: function (json) {
                        me.fireEvent('shipmentRefresh', json);
                    },
                    scope: me
                }
            }
        });
    },

    openManualReassignShipmentModal: function () {
        var me = this;

        if (me.shipmentRecord.shipmentType == "BOPIS") {
            var payload = me.getBopisReassignShipmentPayload();
            me.record.getInventory({
                jsonData: payload,
                success: function (response) {
                    //me.isRecordSaved = true;
                    me.setLoading(false, me.body);
                    var json = Ext.decode(response.responseText, true);
                    Ext.create('Taco.view.order.modal.fulfillment.ShipmentReassign', {
                        layout: 'hbox',
                        width: 1080,
                        height: 450,
                        record: me.record,
                        inventoryData: json,
                        shipmentData: payload,
                        isInventory: true,
                        shipmentRecord: me.shipmentRecord,
                        listeners: {
                            saveSuccess: {
                                fn: function (json) {
                                    me.fireEvent('shipmentRefresh', json);
                                },
                                scope: me
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
        else if (me.shipmentRecord.shipmentType == "Transfer") {
            var payload = me.getReassignTransferShipmentPayload();
            me.record.getCandidateSuggestions({
                jsonData: payload,
                success: function (response) {
                    me.isRecordSaved = true;
                    me.setLoading(false, me.body);
                    var json = Ext.decode(response.responseText, true);
                    Ext.create('Taco.view.order.modal.fulfillment.ShipmentReassign', {
                        layout: 'hbox',
                        width: 1080,
                        height: 450,
                        record: me.record,
                        inventoryData: json,
                        shipmentData: payload,
                        isInventory: false,
                        shipmentRecord: me.shipmentRecord,
                        listeners: {
                            saveSuccess: {
                                fn: function (json) {
                                    me.fireEvent('shipmentRefresh', json);
                                },
                                scope: me
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
        else {
            if (Taco.user.taContext.omsEnabled) {
                var shipment = me.getReassignShipmentPayload();
                me.record.getCandidateSuggestions({
                    jsonData: shipment,
                    success: function (response) {
                        me.isRecordSaved = true;
                        me.setLoading(false, me.body);
                        var json = Ext.decode(response.responseText, true);
                        Ext.create('Taco.view.order.modal.fulfillment.ShipmentReassign', {
                            layout: 'hbox',
                            width: 1080,
                            height: 450,
                            record: me.record,
                            inventoryData: json,
                            shipmentData: shipment,
                            isInventory: false,
                            shipmentRecord: me.shipmentRecord,
                            listeners: {
                                saveSuccess: {
                                    fn: function (json) {
                                        me.fireEvent('shipmentRefresh', json);
                                    },
                                    scope: me
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
            else {
                me.shipmentAutoReassign(me.shipmentRecord.fulfillmentLocationCode);
            }
        }
    },

    getActiveTaskList: function () {
        if (this.shipmentRecord.workflowState && this.shipmentRecord.workflowState.taskList) {
            var taskLists = this.shipmentRecord.workflowState.taskList;
            for (var count = 0; count < taskLists.length; count++) {
                if (taskLists[count].active)
                    return taskLists[count];
            }
        }
    },

    getReasonDescription: function (value) {
        var reasonCodes = this.record.get('csrCancellationReasons');
        if (value && value.reasonCode) {
            if (value.reasonCode == 'Other')
                return value.moreInfo || value.reasonCode;

            if (reasonCodes && reasonCodes.length > 0) {
                for (var i = 0; i < reasonCodes.length; i++) {
                    if (value.reasonCode == reasonCodes[i].get('reasonCode')) {
                        return reasonCodes[i].get('name');
                    }
                }
            }
            return value.reasonCode;
        }
    }
});