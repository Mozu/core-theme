/**
 * @class Taco.view.order.widget.OrderReturns
 */

Ext.define('Taco.view.order.widget.OrderReturns', {
    extend: 'Taco.core.ux.grid.Panel',
    requires: ['Taco.model.Return',
               'Ext.data.Store'],

    title: 'Returns',

    viewConfig: {
        deferEmptyText: false,
        stripeRows: false,
        emptyText: "No returns for this order"
    },

    plugins: [],

    config: {
        order: null,
        record: null
    },
    
    initComponent: function () {
        this.columns = this.getColumnConfig();

        this.callParent(arguments);

        this.on({
            select: {
                scope: this,
                fn: 'handleSelect'
            },
            boxready: {
                scope: this,
                fn: function () { this.addCls('returnable-items-grid'); }
            }
        });
    },

    getColumnConfig: function() {
        return [
            {
                dataIndex: 'returnNumber',
                text: 'Return #',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: false,
                flex: 0.75
            },
            {
                dataIndex: 'createDate',
                text: 'Created Date',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: false,
                flex: 1.25,
                xtype: 'datecolumn',
                format: 'n/j/Y h:i a'
            },
            {
                dataIndex: 'updateDate',
                text: 'Last Modified Date',
                draggable: false,
                sortable: false,
                resizable: false,
                menuDisabled: false,
                flex: 1.25,
                xtype: 'datecolumn',
                format: 'n/j/Y h:i a'
            },
            {
                dataIndex: 'status',
                text: 'Return Status',
                xtype: 'templatecolumn',
                draggable: false,
                resizable: true,
                sortable: false,
                menuDisabled: true,
                hidden: false,
                align: 'left',
                flex: 1,
                tpl: [
                    '<tpl if="this.requiresAction(status)">',
                        '<span class="x-column-content-pill x-column-content-pill-true">{[Taco.core.util.Common.camelToSpace(values.status)]}</span>',
                    '<tplelse>',
                        '<span class="x-column-content-pill x-column-content-pill-false">{[Taco.core.util.Common.camelToSpace(values.status)]}</span>',
                    '</tpl>',
                    {
                        requiresAction: function (status) {
                            var lowerCaseStatus = status.toLowerCase();
                            return lowerCaseStatus === 'created' || lowerCaseStatus === 'authorized';
                        }
                    }
                ]
            },
            {
                dataIndex: 'receiveStatus',
                text: 'Receive Status',
                xtype: 'templatecolumn',
                draggable: false,
                resizable: true,
                sortable: false,
                menuDisabled: true,
                hidden: false,
                align: 'left',
                flex: 1,
                tpl: [
                    '<tpl if="this.requiresAction(receiveStatus)">',
                        '<span class="x-column-content-pill x-column-content-pill-true">{[Taco.core.util.Common.camelToSpace(values.receiveStatus)]}</span>',
                    '<tplelse>',
                        '<span class="x-column-content-pill x-column-content-pill-false">{[Taco.core.util.Common.camelToSpace(values.receiveStatus)]}</span>',
                    '</tpl>',
                    {
                        requiresAction: function (status) {
                            var lowerCaseStatus = status.toLowerCase();
                            return lowerCaseStatus === 'waiting' || lowerCaseStatus === 'partiallyreceived';
                        }
                    }
                ]
            },
            {
                dataIndex: 'refundStatus',
                text: 'Refund Status',
                xtype: 'templatecolumn',
                draggable: false,
                resizable: true,
                sortable: false,
                menuDisabled: true,
                hidden: false,
                align: 'left',
                flex: 1,
                tpl: [
                    '<tpl if="this.requiresAction(refundStatus)">',
                        '<span class="x-column-content-pill x-column-content-pill-true">{[Taco.core.util.Common.camelToSpace(values.refundStatus)]}</span>',
                    '<tplelse>',
                        '<span class="x-column-content-pill x-column-content-pill-false">{[Taco.core.util.Common.camelToSpace(values.refundStatus)]}</span>',
                    '</tpl>',
                    {
                        requiresAction: function (status) {
                            var lowerCaseStatus = status.toLowerCase();
                            return lowerCaseStatus === 'notrefunded' || lowerCaseStatus === 'partiallyrefunded';
                        }
                    }
                ]
            },
            {
                dataIndex: 'replaceStatus',
                text: 'Replace Status',
                xtype: 'templatecolumn',
                draggable: false,
                resizable: true,
                sortable: false,
                menuDisabled: true,
                hidden: false,
                align: 'left',
                flex: 1,
                tpl: [
                    '<tpl if="this.requiresAction(replaceStatus)">',
                        '<span class="x-column-content-pill x-column-content-pill-true">{[Taco.core.util.Common.camelToSpace(values.replaceStatus)]}</span>',
                    '<tplelse>',
                        '<span class="x-column-content-pill x-column-content-pill-false">{[Taco.core.util.Common.camelToSpace(values.replaceStatus)]}</span>',
                    '</tpl>',
                    {
                        requiresAction: function (status) {
                            var lowerCaseStatus = status.toLowerCase();
                            return lowerCaseStatus === 'notreplaced' || lowerCaseStatus === 'partiallyrefunded';
                        }
                    }
                ]
            },
            {
                dataIndex: 'productTotal',
                text: 'Return Amount',
                draggable: false,
                resizable: true,
                sortable: false,
                menuDisabled: true,
                hidden: false,
                align: 'right',
                flex: 1,
                renderer: function (value) {
                    return Taco.app.context.getCurrent().formatCurrency(value);
                }
            }
        ];
    },

    reload: function () {
        // TODO: do something on reload e.g:

        // this.removeAll();
        // var returnsStore = this.order.getReturnsStore();
        // returnsStore.load();
    },

    handleSelect: function (selModel, record) {
        // TODO: handle select
        Taco.core.StateManager.attemptNavigate('/returns/edit/' + record.data.id);
    }
});
