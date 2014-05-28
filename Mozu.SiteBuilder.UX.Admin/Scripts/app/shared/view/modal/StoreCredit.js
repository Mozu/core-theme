Ext.define('Taco.shared.view.modal.StoreCredit', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.data.Store',
        'Ext.grid.plugin.CellEditing',
        'Taco.store.StoreCredits'
    ],
    autoShow: true,
    width: 900,
    minHeight:50,
    title: 'Store Credit',
    formCfg: null,
    closable: true,
    layout:'fit',
    closeAction: 'destroy',
    actions: [{
        xtype: 'button',
        itemId: 'primaryAction',
        text: 'Close',
        handler: function () {
            var me = this;
            me.close();
        },
        formBind: true
    }],

    initComponent: function () {
        var me = this;
        //me.cls += ' ' + Taco.baseCSSPrefix + 'address-editor';
        
        this.storeCredits = this.record.getStoreCredits();

        me.grid = Ext.create('Ext.grid.Panel', {
            store: this.storeCredits ,
            selType: 'cellmodel',
            viewConfig: {
                deferEmptyText: false,
                stripeRows: false,
                emptyText: '<div class="empty-grid-message">No store credits to display</div>'
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
            columns: {
                defaults: {
                    draggable: false,
                    resizable: true,
                    sortable: false,
                    menuDisabled: true
                },
                items: [
                    { text: 'Code', dataIndex: 'code', width: 140 },
                    { text: 'Date Issued', dataIndex: 'activationDate', flex: 1 },
                    { text: 'Amount', dataIndex: 'initialBalance', width: 80, align: "right", renderer: 'usMoney'},
                    // no data for this column
                    //{ text: 'Issued By', dataIndex: 'issuedBy', flex: 1 },
                    {
                        text: 'Expires',
                        dataIndex: 'expirationDate',
                        flex: 1
                        /*,
                        editor: {
                            emptyText: "Amount",
                            msgTarget: "qtip",
                            xtype: "datefield",
                            selectOnFocus: true,
                            allowBlank: false
                        }*/
                    },
                    {
                        text: 'Balance',
                        dataIndex: 'currentBalance',
                        align: "right",
                        renderer: 'usMoney',
                        width: 100
                        /*,
                        editor: {
                            emptyText: "Amount",
                            msgTarget: "qtip",
                            xtype: "numberfield",
                            hideTrigger: true,
                            defaultValue: 0,
                            mouseWheelEnabled: false,
                            selectOnFocus: true,
                            allowBlank: false
                        }*/
                    }
                ],
            },
            scope: this
        });

        this.items = [ me.grid ];

        this.callParent(arguments);
    }
});
