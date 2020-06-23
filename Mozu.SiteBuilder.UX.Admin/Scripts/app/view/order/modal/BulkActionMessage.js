/**
 * @class Taco.view.order.modal.BulkActionMessage
 */

Ext.define('Taco.view.order.modal.BulkActionMessage', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    header: false,
    scale: 'small',
    title: Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.title,

    layout: {
        type: 'card'
    },

    actionBar: {
        layout: {
            type: 'hbox',
            pack: 'center'
        }
    },

    actions: [{
        ui: 'action',
        itemId: 'primaryAction',
        text: Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.dismiss
    }],

    config: {
        success: false,
        message: '',
        orders: []
    },

    initComponent: function () {
        var isSuccess = this.getSuccess();
        var message = this.getMessage();
        var orders = this.getOrders();

        this.ordersStore = Ext.create('Ext.data.Store', {
            autoLoad: true,
            data: orders,
            fields: [
                { type: 'string', name: 'orderNumber' },
                { type: 'string', name: 'orderId' },
                { type: 'string', name: 'message' },
                { type: 'boolean', name: 'successful' }
            ]
        });

        this.summaryCard = Ext.create('Ext.panel.Panel', {
            title: Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.first,
            header: false,
            layout: 'fit',
            html: [
                '<div class="taco-bulk-actions-message ',
                (isSuccess ? 'success' : 'error'),
                '"><div class="message-heading">',
                (isSuccess ? Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.success_message : Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.error_message),
                '</div><div class="message">',
                    message,
                '<a class="show-link">' + Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.details + '</a></div></div>'
            ].join('')
        });

        this.detailsCard = Ext.create('Ext.panel.Panel', {
            xtype: 'panel',
            title: Localizer.langResources.ORDERS.Orders.OrderDetails.Actions.second,
            header: false,
            layout: 'fit',
            bodyPadding: '9 0 0',
            items: [{
                xtype: 'grid',
                store: this.ordersStore,
                columns: [{
                    dataIndex: 'orderNumber',
                    text: Localizer.langResources.ORDERS.Orders.OrderDetails.DetailsCard.order,
                    flex: 1
                }, {
                    dataIndex: 'successful',
                        text: Localizer.langResources.ORDERS.Orders.OrderDetails.DetailsCard.result,
                    flex: 1,
                    renderer: function (value) {
                        return value ? Localizer.langResources.ORDERS.Orders.OrderDetails.DetailsCard.succeeded : Localizer.langResources.ORDERS.Orders.OrderDetails.DetailsCard.failed;
                    }
                }, {
                    dataIndex: 'message',
                        text: Localizer.langResources.ORDERS.Orders.OrderDetails.DetailsCard.message,
                    flex: 3,
                    renderer: function (value) {
                        return Ext.String.format('<span title="{0}">{0}</span>', value);
                    }
                }]
            }]
        });

        this.items = [this.summaryCard, this.detailsCard];

        this.callParent(arguments);

        this.summaryCard.on({
            click: {
                scope: this,
                element: 'el',
                fn: function (e, el) {
                    e.preventDefault();
                    
                    if (e.getTarget('.show-link', 10)) {
                        this.getLayout().setActiveItem(1);
                    }
                }
            }
        });
    },

    doSave: function () {
        this.saveSuccess();
    }
});
