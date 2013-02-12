/**
 * @class Taco.view.order.Grid
 */
Ext.define('Taco.view.order.Grid', {
    extend: 'Taco.core.ux.BaseGrid',

    initComponent: function () {
        var me = this;

        this.activeFilters = [];

        this.columns = [{
            dataIndex: 'orderNumber',
            text: 'Order #',
            align: 'right',
            flex: 1,
            renderer: function (value) {
                return '<a href="#" class="taco-launch-editor">' + value + '</a>';
            }
        }, {
            xtype: 'datecolumn',
            dataIndex: 'updateDate',
            text: 'Order Date',
            format: 'm/d/y',
            flex: 1
        }, {
            //dataIndex: 'payment',
            dataIndex: 'billingFirstName',
            text: 'First Name',
            flex: 2/*,
            renderer: function (value) {
                if (!value || !value.card || !value.card.billingAddress) {
                    return '';
                }
                return value.card.billingAddress.firstName;
            }*/
        }, {
            //dataIndex: 'payment',
            dataIndex: 'billingLastName',
            text: 'Last Name',
            flex: 2/*,
            renderer: function (value) {
                if (!value || !value.card || !value.card.billingAddress) {
                    return '';
                }
                return value.card.billingAddress.lastName;
            }*/
        }, {
            xtype: 'numbercolumn',
            dataIndex: 'total',
            text: 'Order Amount',
            format: '$0.00',
            align: 'right',
            flex: 1
        }, {
            dataIndex: 'fulfillmentStatus',
            text: 'Status',
            flex: 1
        }];

        this.pager = Ext.create('Taco.core.ux.grid.Pager', {
            store: this.store
        });

        this.dockedItems = [
        //     xtype: 'toolbar',
        //     dock: 'top',
        //     items: [{
        //         xtype: 'textfield',
        //         width: 400,
        //         emptyText: 'Search orders',
        //         enableKeyEvents: true,
        //         listeners: {
        //             'keyup': {
        //                 fn: me.onKeyUp,
        //                 scope: me
        //             }
        //         }
        //     }]
        // },
        this.pager];

        this.callParent(arguments);
    },

    onKeyUp: function (field) {
        var me = this;

        this.store.currentPage = 1;

        if (field.value.length == 0) {
            this.store.filters.removeAtKey(this.id);

            this.store.load();
            return;
        }
        if (Ext.isNumeric(field.value) || field.value.length >= 3) {
            this.store.filters.add(this.id, Ext.create('Ext.util.Filter', {
                anyMatch: true,
                property: 'query',
                value: field.getValue(),
                root: 'data'
            }));
            this.store.load();
            return;
        }
    }
});
