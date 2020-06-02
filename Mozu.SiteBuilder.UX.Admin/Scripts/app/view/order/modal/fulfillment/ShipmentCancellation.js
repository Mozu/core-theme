Ext.define('Taco.view.order.modal.fulfillment.ShipmentCancellation', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.TextField',
    ],
    
    autoShow: true,
    closeAction: 'destroy',
    primaryText: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Title.cancel_shipment,
    secondaryText: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Buttons.nevermind,
    scale: 'small',
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Title.cancel_shipment+'?',
    isRecordSaved: false,
    layout: {
        type: 'fit'
    },

    initComponent: function () {

        this.fieldContainer = Ext.create('Ext.form.FieldContainer', {
            name: 'cancelShipment',
            monitorValid: true,
            width: '100%',
            items:
                [
                    {
                        xtype: 'container',
                        layout: 'vbox',
                        width: '100%',
                        defaults: {
                            style: {
                                margin: '0 20 0 0'
                            }
                        },
                        items:
                            [                                
                                {
                                    xtype: 'combobox',
                                    width: 270,
                                    name: 'cancelReason',
                                    itemId: 'cancelReason',
                                    valueField: 'reasonCode',
                                    displayField: 'name',
                                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.cancel_reason,
                                    queryMode: 'local',
                                    margin: '0px 5px 0px 5px',
                                    allowBlank: false,
                                    editable: false,
                                    forceSelection: true,
                                    store: this.store,
                                    listeners: {
                                        change: {
                                            scope: this,
                                            fn: function (combobox, newValue) {
                                                var newRecord = combobox.findRecordByValue(newValue);
                                                if (newRecord) {
                                                    this.down('[name=otherReason]').setVisible(newRecord.get('needsMoreInfo'));
                                                    this.down("#primaryAction").setDisabled(!this.validateModal());
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: 'textfield',
                                    width: 270,
                                    id: 'otherReason',
                                    name: 'otherReason',
                                    hideTrigger: true,
                                    margin: '0px 5px 0px 5px',
                                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Label.specify_reason,
                                    hidden: true,
                                    listeners: {
                                        change: {
                                            scope: this,
                                            fn: function (field, value) {
                                                this.down("#primaryAction").setDisabled(!this.validateModal());
                                            }
                                        }
                                    }
                                }
                            ]
                    }
                ],
            scope: this
        }, this);

        this.items = [this.fieldContainer];

        this.callParent(arguments);

    },

    validateModal: function () {
        //verify cancel reason should be filled
        var reason = (this.down('#cancelReason').getValue() === 'Other'
            ? this.down('#otherReason').getValue()
            : this.down('#cancelReason').getValue());
        if (!reason)
            return false;

        return true;
    },

    getCancelShipmentPayload: function () {

        var me = this;
        
        var order = this.record;
        var reason = this.down('#cancelReason').getValue();
        var description = (this.down('[name=otherReason]').isVisible() ?
            this.down('#otherReason').getValue() : null);

        return {
            shipmentNumber: me.shipmentRecord.number,
            cancelShipment: {
                canceledReason: {
                    reasonCode: reason,
                    moreInfo: description
                }
            }
        };
    },

    doSave: function () {

        if (this.validateModal()) {
            var me = this;

            Ext.MessageBox.show({
                title: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.cancel_shipment,
                // pushes the buttons to the right to be consistant with our dialog ux.
                rightJustifyButtons: true,
                // reverses the order of the buttons
                reverseOrder: true,
                msg: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.cancel_this_shipment,
                closable: false,
                buttons: Ext.Msg.YESNO,
                fn: function (val) {
                    if (val === 'yes') {
                        me.setLoading(true, me.body);
                        var order = me.record;
                        var payloadData = me.getCancelShipmentPayload();

                        order.cancelShipment({
                            jsonData: payloadData,
                            success: function (response) {
                                // success handling here
                                var json = Ext.decode(response.responseText, true);
                                if (response.status != 200) {
                                    Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_canceling_shipment, 'error');
                                    me.fireEvent('saveFailure');
                                    return;
                                }
                                Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.shipment + " " + payloadData.shipmentNumber + " " + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.successfully_cancelled, 'success');
                                me.fireEvent('shipmentCancelled');
                                me.close();
                            },
                            failure: function (response) {
                                me.setLoading(false);
                                // error handling here
                                var json = Ext.decode(response.responseText, true),
                                    msg = (json && json.message) ? json.message : Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.error_canceling_shipment;
                                Taco.app.fireEvent('setmessage', msg, 'error');
                                me.fireEvent('saveFailure');
                            },
                            scope: me
                        });
                    }
                }
            });
        }
    },
    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function (destroy) {
        this.callParent(arguments);
    }
});