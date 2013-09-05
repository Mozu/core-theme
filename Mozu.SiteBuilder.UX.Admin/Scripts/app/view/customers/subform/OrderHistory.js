Ext.define('Taco.view.customers.subform.OrderHistory', {
    extend: 'Taco.view.customers.subform.Subform',
    title: 'Order History',
    initComponent: function () {

        var record = this.record;
        this.items = [{
            xtype: 'grid',
            listeners: {
                itemclick: function (grid, record) {
                    Taco.core.StateManager.attemptNavigate('/orders/edit/' + record.getId());
                }
            },
            store: record,
            columns: [
                { text: 'Order Id', dataIndex: 'orderNumber', flex: 1 },
                { xtype: 'datecolumn', text: 'Order Date', dataIndex: 'createDate', flex: 1 },
                { text: 'Order Amount', dataIndex: 'total', flex: 1 },
                { text: 'Status', dataIndex: 'paymentStatus', flex: 1 }
            ],

        }];

        this.callParent(arguments);
    }
});