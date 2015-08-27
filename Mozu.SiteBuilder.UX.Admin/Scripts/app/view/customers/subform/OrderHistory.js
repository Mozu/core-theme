Ext.define('Taco.view.customers.subform.OrderHistory', {
    extend: 'Taco.view.customers.subform.Subform',
    title: 'Order History',
    initComponent: function () {
        var orderStore = this.record;

        this.items = [{
            xtype: 'grid',
            listeners: {
                itemclick: function (grid, record) {
                    Taco.core.StateManager.attemptNavigate('/orders/edit/' + record.getId());
                }
            },
            store: orderStore,
            stateful: true,
            stateId:"statefulOrderHistoryGrid",
            columns: [
                { text: 'Order Id', stateId: "orderId",  dataIndex: 'orderNumber', flex: 1 },
                { xtype: 'datecolumn', stateId: "orderDate", text: 'Order Date', dataIndex: 'submittedDate', flex: 1 },
                {
                    text: 'Order Amount', dataIndex: 'total',
                    stateId: "orderAmount",
                    renderer: function (value, metaData, record) {
                        return record.formatCurrency(value);
                    },
                    flex: 1
                },
                { text: 'Status', stateId: "orderStatus", dataIndex: 'orderStatus', flex: 1 }
            ]

        }];

        this.callParent(arguments);
    }
});