/**
 * The discount editor view
 */
Ext.define('Taco.view.settings.paymentTypes.subform.CreditCards', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.model.CardGateway'
    ],
    margin: "0 0 20 0",
    title: 'Credit Cards',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",

    initComponent: function () {
        var me = this;

        me.header = null;

        me.items = [];
        
        me.paymentGatewaysStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.PaymentGateways');

        me.cardGateways = me.record.get('cardGatewayMap');
        me.cardGatewayStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.CardGateway',
            autoLoad: false,
            remoteSort: false,
            remoteFilter: false,
            data: me.cardGateways
        });

        me.gatewayCombo = Ext.create("Ext.form.field.ComboBox", {
            store: me.paymentGatewaysStore,
            editable: false,
            forceSelection: true,
            allowBlank: false,
            displayField: 'name',
            valueField: 'id',
            listeners: {
                render: function (combo) {
                    var me = this;
                    var editor = combo.ownerCt;
                }
            }
        });

        me.cardGatewayMap = [];
        me.syncCardGatewayMap = function () {
            var raw = Ext.Array.pluck(me.cardGatewayStore.data.items, 'data');
            me.cardGatewayMap = raw;
        };
                
        me.syncCardGatewayMap();
        me.supportedCardsGrid = Ext.widget({
            xtype: 'grid',
            listeners: { },
            store: me.cardGatewayStore,
            enableColumnHide: false,
            sortableColumns: false,
            selType: 'rowmodel',
            columns: [
                {
                    text: 'Enable',
                    xtype: 'checkcolumn',
                    dataIndex: 'isEnabled',
                    flex: 1,
                    value: 'cardType',
                    listeners: {
                        checkchange: function (col, rowIndex, checked, opts) {
                            me.syncCardGatewayMap();
                            
                            if (checked) {
                                me.paymentGatewaysStore.load({
                                    scope: me,
                                    callback: function (records, operation, success) {
                                        var plugin = me.supportedCardsGrid.getPlugin('cardCellEditor');
                                        plugin.startEdit(rowIndex, 2);

                                        me.gatewayCombo.expand();
                                        me.gatewayCombo.focus(null, 10);
                                        var recordToSelect = me.gatewayCombo.store.getAt(0);
                                        if (recordToSelect) {
                                            me.gatewayCombo.select(recordToSelect);
                                        }
                                    }
                                });
                            }
                            
                        }
                    }
                },
                {
                    text: 'Card Type',
                    dataIndex: 'cardDisplay',
                    flex: 2
                },
                {
                    text: 'Payment Gateway',
                    showBorder: true,
                    msgTarget: "qtip",
                    editor: me.gatewayCombo,
                    renderer: function (value, metaData, record) {
                        if (value) {
                            var gateway = me.paymentGatewaysStore.findRecord('id', value);
                            if (gateway && record.get('isEnabled')) {
                                var name = gateway.get('name');
                                return name;
                            }
                            return '';
                        }
                        return '';
                    },
                    dataIndex: 'gatewayId',
                    flex: 3,
                }
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    pluginId: "cardCellEditor"
                })
            ],
            width: 500
        });

        me.selectFirstGateway = function (rowIndex) {
            me.supportedCardsGrid.getView().select(rowIndex);

            me.supportedCardsGrid.fireEvent('itemclick', me.supportedCardsGrid)

            me.gatewayCombo.expand();
            me.gatewayCombo.focus(null, 10);
            var recordToSelect = me.gatewayCombo.store.getAt(0);
            if (recordToSelect) {
                me.gatewayCombo.select(recordToSelect);
            }
        };

        me.supportedCardsGrid.on('beforeedit', function (grid, e) {

            if (!e.record.get('isEnabled')) {
                return false;
            }
        });

        me.supportedCardsGrid.on('validateedit', function (editor, e) {
            var gateway = me.paymentGatewaysStore.findRecord('id', e.value);
            if (!gateway)
                return;
            var gatewayDef = gateway.get('gatewayDefinition');
            if (!gatewayDef)
                return;
            var cards = gatewayDef.supportedCards;
            var gateWayName = gatewayDef.name;
            var cardType = e.record.get('cardType');
            if (!cardType)
                return;
            //fail if the card isnt supported on the gateway def
            if ( !cards.find(function (_) { return _.key.toLowerCase() === cardType.toLowerCase() }))
            {
                Taco.app.fireEvent('setmessage', 'payment type not available on ' + gateWayName, 'error');
                return false;
            }


        });

        me.paymentProcessingFlowTypeRg = Ext.widget(
            {
                xtype: 'radiogroup',
                fieldLabel: 'Order Processing',
                // Arrange radio buttons into two columns, distributed vertically
                columns: 1,
                vertical: true,
                items: [
                    { boxLabel: 'Authorize And Capture On Order Placement', name: 'paymentProcessingFlowType', inputValue: 'AuthorizeAndCaptureOnOrderPlacement', disabled: me.record.get('isMultiShipToEnabled') },
                    { boxLabel: 'Authorize On Order Placement And Capture On Order Shipment', name: 'paymentProcessingFlowType', inputValue: 'AuthorizeOnOrderPlacementAndCaptureOnOrderShipment' },
                ]
            });
        if (me.cardGateways && me.cardGateways.length) {
            me.items.push(me.supportedCardsGrid, me.paymentProcessingFlowTypeRg);
        }
        else {
            me.items.push({
                xtype: 'box',
                html: 'click <a href="#">here</a> to setup a gateway',
                listeners: {
                    click: {
                        fn: function(){
                            Taco.core.StateManager.attemptNavigate('settings/paymentGateways');
                        },
                        element: 'el',
                        scope: this 
                    }
                }
            });
        }



        me.callParent(arguments);
    },
    initTitle: Ext.emptyFn,
    
    persistFormValues: function () {
        var me = this;

        me.record.set('cardGatewayMap', me.cardGatewayMap);
    }
});