/**
 * @class Taco.view.order.widget.ReturnReplacementGrid
 */

Ext.define('Taco.view.order.widget.ReturnReplacementGrid', {
    extend: 'Ext.grid.Panel',
    title: 'Replacements',
    cls: 'return-notes-grid',
    config: {
        orderId: null
    },
    viewConfig: {
        emptyText: '<div class="empty-grid-message">No replacement orders to display</div>',
        trackOver: false,
        disableSelection: true,
        deferEmptyText: false
    },
    columns: [
        {
            dataIndex: 'createDate',
            text: 'Created Date',
            draggable: false,
            sortable: false,
            resizeable: false,
            menuDisabled: true,
            xtype: 'datecolumn',
            format: 'M d Y g:ia',
            flex: 1
        },
        {
            dataIndex: 'createByName',
            text: 'Created By',
            draggable: false,
            sortable: false,
            resizeable: false,
            menuDisabled: true,
            flex: 1
        },
        {
            dataIndex: 'orderNumber',
            text: 'Order #',
            draggable: false,
            sortable: false,
            resizeable: false,
            menuDisabled: true,
            flex: 1
        },
        {
            dataIndex: 'orderStatus',
            text: 'Order Status',
            draggable: false,
            sortable: false,
            resizeable: false,
            menuDisabled: true,
            flex: 1
        }
    ],
    listeners: {
        itemclick: function(grid, record) {
            Taco.core.StateManager.attemptNavigate('s-' + record.data.siteId + '/orders/edit/' + record.data.id);
        }
    }

    //this.on('itemclick', function(grid, record) {
    //    console.log('stuff clicked');
    //});
});