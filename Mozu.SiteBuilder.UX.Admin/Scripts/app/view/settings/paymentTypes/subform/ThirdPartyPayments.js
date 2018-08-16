/**
 * Third Party Payments view
 */
Ext.define('Taco.view.settings.paymentTypes.subform.ThirdPartyPayments', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.model.CardGateway'
    ],
    margin: "0 0 20 0",
    title: 'Third Party Payments',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",

    initComponent: function () {
        var me = this;

        me.header = null;

        me.items = [];       
        me.cardGateways = me.record.get('cardGatewayMap');

        me.cardGatewayStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.CardGateway',
            autoLoad: false,
            remoteSort: false,
            remoteFilter: false,
            data: me.cardGateways
        });

        me.cardGatewayStore.filterBy(function (model) {
            if (model.data.paymentType !== 'CC' && model.data.paymentType !== "GC") {
                return true;
            }
            return false;
        });

        var paymentGatewayStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.PaymentGateways')

        me.cardGatewayStore.data.items.forEach(function (cardGateWay, idx) {
            var externalPaymentName = cardGateWay.get('cardType');
            var paymentContainerItems = [];
            var isEnabled = cardGateWay.get('isEnabled');

            //Get Supported Gateways for each payment type  
            var primaryGatewayStore = Taco.core.data.StoreManager.deepCloneStore('Taco.store.PaymentGateways')
            primaryGatewayStore.load({
                scope: me,
                callback: function () {

                }
            });

            primaryGatewayStore.filter([{
                filterFn: function (item, cardGatewayStore) {
                    var gatewaySupportedCards = item.get("gatewayDefinition").supportedCards;

                    if (Ext.Array.findBy(gatewaySupportedCards, function (item) {
                        return item.type.toLowerCase() === externalPaymentName.toLowerCase();
                    })) { return true }
                    return false;
                }
            }])

            var currentCardGateway = Ext.Array.findBy(me.cardGateways, function (cardGateway, idx) {
                return cardGateway.cardType === externalPaymentName;
            });

            //configuraiton items

            var primaryGateway = Ext.create('Ext.form.field.ComboBox', {
                xtype: 'combobox',
                width: 180,
                fieldLabel: 'Third Party Account',
                valueField: 'name',
                displayField: 'name',
                forceSelection: true,
                store: primaryGatewayStore,
                listeners: {
                    select: function (combo, record, eOpts) {
                        if (record) {
                            me.cardGateways.forEach(function (card, idx) {
                                if (card.cardType.toLowerCase() === externalPaymentName.toLowerCase()) {
                                    me.cardGateways[idx] = Object.assign(card,
                                        {
                                            gatewayId: record[0].data.id,
                                            gatewayName: record[0].data.name
                                        });
                                }
                            });


                            me.record.set('cardGatewayMap', me.cardGateways);
                        }
                    }
                }
            });

            var secondaryGateway = Ext.create('Ext.form.field.ComboBox', {
                xtype: 'combobox',
                width: 180,
                itemId: externalPaymentName + 'ProcessingGateway',
                fieldLabel: 'Processing Gateway',
                tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                    elementId: externalPaymentName + 'ProcessingGateway',
                    hoverTarget: 'label',
                    messageKey: 'thirdPartyPayment.processingGateway',
                    offsetLeft: 15,
                    offsetTop: 15
                }),
                valueField: 'name',
                displayField: 'name',
                forceSelection: true,
                store: paymentGatewayStore,
                listeners: {
                    select: function (combo, record, eOpts) {
                        if (record) {
                            me.cardGateways.forEach(function (card, idx) {
                                if (card.cardType.toLowerCase() === externalPaymentName.toLowerCase()) {
                                    me.cardGateways[idx] = Object.assign(card, {
                                        processingGatewayId: record[0].data.id,
                                        processingGatewayName: record[0].data.name
                                    });
                                }
                            })


                            me.record.set('cardGatewayMap', me.cardGateways);
                        }
                    }
                }
            });


            var orderProcessingSetting = Ext.widget(
                {
                    xtype: 'radiogroup',
                    fieldLabel: 'Order Processing',
                    // Arrange radio buttons into two columns, distributed vertically
                    columns: 1,
                    id: externalPaymentName + 'orderProcessingValue',
                    vertical: true,
                    items: [
                        { boxLabel: 'Authorize And Capture On Order Placement', name: externalPaymentName + '1', inputValue: 'AuthorizeAndCaptureOnOrderPlacement', disabled: me.record.get('isMultiShipToEnabled') },
                        { boxLabel: 'Authorize On Order Placement And Capture On Order Shipment', name: externalPaymentName + '1', inputValue: 'AuthorizeOnOrderPlacementAndCaptureOnOrderShipment' },
                    ],
                    listeners: {
                        change: function (self, newValue, oldValue, eOpts) {
                            var radioButtonName = externalPaymentName + '1'
                            if (newValue[radioButtonName] !== oldValue[radioButtonName]) {
                                var tpps = me.record.get('thirdPartyPaymentSettings');
                                var currentTpp = Ext.Array.findBy(tpps, function (item, idx) {
                                    return item.type === externalPaymentName
                                });
                                if (currentTpp) {
                                    currentTpp.paymentProcessingFlowType = newValue[radioButtonName];
                                }
                                else {
                                    var newItem = { type: externalPaymentName, paymentProcessingFlowType: newValue[radioButtonName] }
                                    tpps.push(newItem);
                                }

                                me.record.set('thirdPartyPaymentSettings', tpps);
                            }
                        }
                    }
                });

            var configPanel = Ext.widget({
                xtype: 'panel',
                hidden: !isEnabled,
                items: [
                    primaryGateway,
                    secondaryGateway,
                    orderProcessingSetting
                ]
            });


            var onEnableChange = function () {
                if (this.getValue()) {
                    currentCardGateway.isEnabled = true;
                    me.record.set('cardGatewayMap', me.cardGateways);
                    configPanel.show();
                } else {
                    currentCardGateway.isEnabled = false;
                    me.record.set('cardGatewayMap', me.cardGateways);
                    configPanel.hide();
                }
            }

            var enablePaymentCheckbox = Ext.widget({
                xtype: 'checkbox',
                boxLabel: externalPaymentName,
                name: externalPaymentName + 'EnableCheckbox',
                checked: isEnabled,
                id: externalPaymentName + 'Id',
                handler: onEnableChange
            });

            paymentContainerItems.push(enablePaymentCheckbox);
            paymentContainerItems.push(configPanel);

            var paymentContainer = Ext.widget({
                xtype: 'container',
                layout: 'vbox',
                padding: '0 5 10 5',
                margin: '0,10,10,10',
                items: paymentContainerItems
            });

            var panel = Ext.create('Ext.panel.Panel', {
                record: me.record,
                items: paymentContainer
            });
            me.items.push(panel);

            // Select Inital PaymentGateways


            //Primary Gateway 
            var matchingPrimaryGatewayIdx = primaryGatewayStore.findBy(function (gateway, idx) {
                return gateway.get('id') === cardGateWay.get('gatewayId');
            });

            if (matchingPrimaryGatewayIdx !== null) {
                var matchingPrimaryGateway = primaryGatewayStore.getAt(matchingPrimaryGatewayIdx);
                primaryGateway.select(matchingPrimaryGateway);
            };

            //Secondary Gateway
            var matchingProcessingGatewayIdx = paymentGatewayStore.findBy(function (gateway, idx) {
                return gateway.get('id') === cardGateWay.get('processingGatewayId');
            });

            if (matchingProcessingGatewayIdx !== null) {
                var matchingProcessingGateway = paymentGatewayStore.getAt(matchingProcessingGatewayIdx);
                secondaryGateway.select(matchingProcessingGateway);
            };


            var tpps = me.record.get('thirdPartyPaymentSettings');
            if (tpps) {
                var controlName = externalPaymentName + '1';

                var currentTpp = Ext.Array.findBy(tpps, function (tpp, idx) {
                    return tpp.type === externalPaymentName;
                });
                if (currentTpp) {
                    var settingValue = currentTpp.paymentProcessingFlowType;
                    var controlItem = Ext.Array.findBy(orderProcessingSetting.items.items, function (item, idx) {
                        return item.inputValue == settingValue && item.name === controlName;
                    });
                    var index = Ext.Array.indexOf(orderProcessingSetting.items.items, controlItem);
                    orderProcessingSetting.items.items[index].setValue(true);
                }

            }

        });

        me.callParent(arguments);
    },
    initTitle: Ext.emptyFn,
});