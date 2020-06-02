/**
 * @class Taco.view.order.widget.ReturnInternalNotesGrid
 */

Ext.define('Taco.view.order.widget.ReturnInternalNotesGrid', {
    extend: 'Ext.grid.Panel',
    title: 'Internal Notes',
    cls: 'return-notes-grid',
    config: {
        store: null
    },
    viewConfig: {
        emptyText: '<div class="empty-grid-message">' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.no_internal_notes +'< /div>',
        trackOver: false,
        disableSelection: true,
        deferEmptyText: false
    },
    columns: [
        {
            dataIndex: 'createDate',
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.created_date,
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
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.created_by,
            draggable: false,
            sortable: false,
            resizeable: false,
            menuDisabled: true,
            flex: 1
        },
        {
            dataIndex: 'text',
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.notes,
            draggable: false,
            sortable: false,
            resizeable: false,
            menuDisabled: true,
            flex: 3
        }
    ]
});