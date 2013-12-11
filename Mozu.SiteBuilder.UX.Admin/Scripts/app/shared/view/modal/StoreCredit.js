Ext.define('Taco.shared.view.modal.StoreCredit', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.data.Store',
        'Ext.grid.plugin.CellEditing',
        'Taco.store.StoreCredits'
    ],
    autoShow: true,
    width: 900,
    title: 'Store Credit',
    formCfg: null,
    closable: true,
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
        me.cls += ' ' + Taco.baseCSSPrefix + 'address-editor';
        
        this.storeCredits = this.record.getStoreCredits();

        me.grid = Ext.create('Ext.grid.Panel', {
            store: this.storeCredits ,
            selType: 'cellmodel',
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
            columns: [
                { text: 'Code', dataIndex: 'code'},
                { text: 'Date Issued', dataIndex: 'activationDate' },
                { text: 'Amount', dataIndex: 'initialBalance' },
                { text: 'Issued By', dataIndex: 'issuedBy'},
                {
                    text: 'Expires', dataIndex: 'expirationDate'/*,
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
                    dataIndex: 'currentBalance'/*,
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
            scope: this
        });

        this.items = [
            me.grid,
            {
                xtype: 'checkboxfield',
                boxLabel: 'Notify customer of changes in their Store Credit'
            }];

        this.callParent(arguments);
    }
});
