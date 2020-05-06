Ext.define('Taco.view.order.modal.fulfillment.ShipmentItemCancellation', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.TextField',
    ],

    autoShow: true,
    closeAction: 'destroy',
    primaryText: 'Cancel Items',
    secondaryText: 'Nevermind',
    scale: 'medium',
    title: 'Cancel Items?',
    layout: {
        type: 'fit'
    },

    initComponent: function () {

        this.fieldContainer = Ext.create('Ext.form.FieldContainer', {
            name: 'cancelOrder',
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
                                    xtype: 'numberfield',
                                    width: 110,
                                    name: 'cancelQuantity',
                                    itemId: 'cancelQuantity',
                                    hideTrigger: true,
                                    allowBlank: false,
                                    value: this.selectedItem.quantity,
                                    minValue: 1,
                                    maxValue: this.selectedItem.quantity,
                                    validateOnChange: true,
                                    margin: '0px 5px 0px 5px',
                                    mouseWheelEnabled: false,
                                    fieldLabel: 'Quantity to cancel',
                                    listeners: {
                                        change: {
                                            scope: this,
                                            fn: function (field, value) {
                                                this.down("#primaryAction").setDisabled(!this.validateModal());
                                            }
                                        }
                                    }
                                },
                                {
                                    xtype: 'combobox',
                                    width: 270,
                                    name: 'cancelReason',
                                    itemId: 'cancelReason',
                                    valueField: 'reasonCode',
                                    displayField: 'name',
                                    fieldLabel: 'Cancel Reason',
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
                                    fieldLabel: 'Specify Reason *',
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
        //verify quantity is not null and less than 0 and should not be greater than max quantity
        var quantity = this.down('#cancelQuantity').getValue();

        if (!quantity || quantity <= 0 || quantity > this.selectedItem.quantity)
            return false;

        //verify cancel reason should be filled
        var reason = (this.down('#cancelReason').getValue() === 'Other'
            ? this.down('#otherReason').getValue()
            : this.down('#cancelReason').getValue());

        if (!reason)
            return false;

        return true;
    },

    getCancelItemQuantityPayload: function () {

        var me = this;
        var order = this.record;
        var reason = this.down('#cancelReason').getValue();
        var description = (this.down('[name=otherReason]').isVisible() ?
            this.down('#otherReason').getValue() : null);

        return {
            shipmentNumber: me.shipmentRecord.number,
            cancelItemsRequest: {
                items: [{
                    lineId: me.selectedItem.lineId,
                    name: me.selectedItem.name,
                    productCode: me.selectedItem.productCode,
                    quantity: this.down('#cancelQuantity').getValue(),
                    canceledReason: {
                        reasonCode: reason,
                        moreInfo: description,
                    },
                    //reason: (reason.toLowerCase() == 'other' ? description : reason),
                    imageUrl: me.selectedItem.imageUrl,
                    retailPrice: me.selectedItem.actualPrice,
                    optionAttributeFQN: me.selectedItem.optionAttributeFQN,
                    unitPrice: me.selectedItem.unitPrice,
                    variationProductCode: me.selectedItem.variationProductCode
                }]
            }
        };
    },

    doSave: function () {

        if (this.validateModal()) {
            var me = this;
            Ext.MessageBox.show({
                title: 'Cancel Item',
                // pushes the buttons to the right to be consistant with our dialog ux.
                rightJustifyButtons: true,
                // reverses the order of the buttons
                reverseOrder: true,
                msg: 'Are you certain you want to Cancel this item?',
                closable: false,
                buttons: Ext.Msg.YESNO,
                fn: function (val) {
                    if (val === 'yes') {
                        me.setLoading(true, me.body);
                        var order = me.record;
                        var payloadData = me.getCancelItemQuantityPayload();
                        order.cancelShipmentItems({
                            jsonData: payloadData,
                            success: function (response) {
                                me.setLoading(false, me.body);
                                var json = Ext.decode(response.responseText, true);
                                if (!json || !json.success) {
                                    Taco.app.fireEvent('setmessage', 'Error while canceling shipment item', 'error');
                                    return;
                                }
                                Taco.app.fireEvent('setmessage', "Item " + payloadData.cancelItemsRequest.items[0].name + " Successfully Cancelled", 'success');
                                me.saveSuccess();
                                me.close();
                            },
                            failure: function (response) {
                                me.setLoading(false, me.body);
                                Taco.app.fireEvent('setmessage', 'Error while canceling shipment item', 'error');
                                // close the dialog
                                me.close();
                            }
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