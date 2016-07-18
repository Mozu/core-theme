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
        emptyText: '<div class="empty-grid-message">No internal notes to display</div>',
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
            dataIndex: 'text',
            text: 'Note',
            draggable: false,
            sortable: false,
            resizeable: false,
            menuDisabled: true,
            flex: 3
        }
    ]
});