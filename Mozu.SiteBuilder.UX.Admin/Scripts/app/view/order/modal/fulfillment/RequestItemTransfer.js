Ext.define('Taco.view.order.modal.fulfillment.RequestItemTransfer', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.TextField',
    ],

    autoShow: true,
    closeAction: 'destroy',
    primaryText: 'Transfer Item',
    secondaryText: 'Nevermind',
    scale: 'small',
    title: 'Transfer Item?',
    layout: {
        type: 'fit'
    },

    initComponent: function () {

        this.fieldContainer = Ext.create('Ext.form.FieldContainer', {
            name: 'transferShipmentItem',
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
                            [{
                                xtype: 'label',
                                text: 'Quantity available to transfer',
                                margin: '0px 5px 0px 5px',
                            }, {
                                    xtype: 'label',
                                    text: this.selectedItem.quantityAvailToTransfer,
                                    margin: '10px 5px 0px 5px',
                                },
                            {
                                xtype: 'numberfield',
                                width: 110,
                                name: 'transferQuantity',
                                itemId: 'transferQuantity',
                                hideTrigger: true,
                                allowBlank: false,
                                value: this.selectedItem.quantityAvailToTransfer,
                                minValue: 1,
                                maxValue: this.selectedItem.quantityAvailToTransfer,
                                validateOnChange: true,
                                margin: '0px 5px 0px 5px',
                                mouseWheelEnabled: false,
                                fieldLabel: 'Quantity to transfer',
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
        var quantity = this.down('#transferQuantity').getValue();

        if (!quantity || quantity <= 0 || quantity > this.selectedItem.quantityAvailToTransfer)
            return false;

        return true;
    },

    getTransferItemQuantityPayload: function () {

        var me = this;
        return {
            shipmentNumber: me.shipmentRecord.number,
            transferItemsRequest: {
                isUserAction: true,
                items: [{
                    lineId: me.selectedItem.lineId,
                    quantity: this.down('#transferQuantity').getValue()
                }]
            }
        };
    },

    doSave: function () {

        if (this.validateModal()) {
            var me = this;
            Ext.MessageBox.show({
                title: 'Transfer Item',
                // pushes the buttons to the right to be consistant with our dialog ux.
                rightJustifyButtons: true,
                // reverses the order of the buttons
                reverseOrder: true,
                msg: 'Are you certain you want to Transfer this item?',
                closable: false,
                buttons: Ext.Msg.YESNO,
                fn: function (val) {
                    if (val === 'yes') {
                        me.setLoading(true, me.body);
                        var order = me.record;
                        var payloadData = me.getTransferItemQuantityPayload();
                        order.transferShipmentItems({
                            jsonData: payloadData,
                            success: function (response) {
                                me.setLoading(false, me.body);
                                var json = Ext.decode(response.responseText, true);
                                if (!json || !json.success) {
                                    Taco.app.fireEvent('setmessage', 'Error while transfering shipment item', 'error');
                                    return;
                                }
                                Taco.app.fireEvent('setmessage', "Item Successfully transferred.", 'success');
                                me.saveSuccess();
                                me.close();
                            },
                            failure: function (response) {
                                me.setLoading(false, me.body);
                                Taco.app.fireEvent('setmessage', 'Error while transfering shipment item', 'error');
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