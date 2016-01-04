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
        var //supportedCards = me.record.get('gateway')['supportedCards'] || [],
            //supportedCardsDef = me.gatewayDefinition.get('supportedCards') || [],
            supportedCardsCbs = [];

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
        
        me.cardGatewayMap = [];
        me.supportedCardsGrid = Ext.widget({
            xtype: 'grid',
            listeners: { },
            store: me.cardGatewayStore,
            enableColumnHide: false,
            sortableColumns: false,
            columns: [
                {
                    text: 'Enable',
                    xtype: 'checkcolumn',
                    dataIndex: 'isEnabled',
                    flex: 1,
                    value: 'cardType',
                    listeners: {
                        checkchange: function (col, rowIndex, checked, opts) {
                            var raw = Ext.Array.pluck(me.cardGatewayStore.data.items, 'data');
                            me.cardGatewayMap = raw;
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
                    editor: {
                        xtype: 'combobox',
                        store: me.paymentGatewaysStore,
                        editable: false,
                        forceSelection: true,
                        allowBlank: false,
                        displayField: 'name',
                        valueField: 'id'
                    },
                    renderer: function (value) {
                        if (value) {
                            var gateway = me.paymentGatewaysStore.findRecord('id', value);
                            if (gateway) {
                                return gateway.get('name');
                            }
                            return '';
                        }
                        return value;
                    },
                    dataIndex: 'gatewayId',
                    flex: 3,
                }
            ],
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
            width: 400
        });

        me.supportedCardsGrid.on('beforeedit', function (grid, e) {

            if (!e.record.get('isEnabled')) {
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
                    { boxLabel: 'Authorize And Capture On Order Placement', name: 'paymentProcessingFlowType', inputValue: 'AuthorizeAndCaptureOnOrderPlacement' },
                    { boxLabel: 'Authorize On Order Placement And Capture On Order Shipment', name: 'paymentProcessingFlowType', inputValue: 'AuthorizeOnOrderPlacementAndCaptureOnOrderShipment' },
                ]
            });
        ;
        me.items.push(me.supportedCardsGrid, me.paymentProcessingFlowTypeRg);

        me.callParent(arguments);
    },
    initTitle: Ext.emptyFn,
    
    persistFormValues: function () {
        var me = this;

        me.record.set('cardGatewayMap', me.cardGatewayMap);
    }
});