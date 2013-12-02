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
    actions: [{
        xtype: 'button',
        itemId: 'primaryAction',
        text: 'Save',
        handler: function () {
            var me = this;
            me.close();
        },
        formBind: true
    },{
        xtype: 'button',
        itemId: 'secondaryAction',
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

        me.storeCreditStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.StoreCredits');
        me.storeCreditStore.load();
        me.wishlistGrid = Ext.create('Ext.grid.Panel', {
            store: this.storeCreditStore,
            selType: 'cellmodel',
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
            columns: [
                { text: 'Code', dataIndex: 'code'},
                { text: 'Date Issued', dataIndex: 'dateIssued'},
                { text: 'Amount', dataIndex: 'issuedAmount'},
                { text: 'Issued By', dataIndex: 'issuedBy'},
                {
                    text: 'Expires', dataIndex: 'expires',
                    editor: {
                        emptyText: "Amount",
                        msgTarget: "qtip",
                        xtype: "datefield",
                        selectOnFocus: true,
                        allowBlank: false
                    }
                },
                {
                    text: 'Balance',
                    dataIndex: 'balance',
                    editor: {
                        emptyText: "Amount",
                        msgTarget: "qtip",
                        xtype: "numberfield",
                        hideTrigger: true,
                        defaultValue: 0,
                        mouseWheelEnabled: false,
                        selectOnFocus: true,
                        allowBlank: false
                    }
                }
            ],
            scope: this
        });

        this.items = [
            me.wishlistGrid,
            {
                xtype: 'checkboxfield',
                boxLabel: 'Notify customer of changes in their Stroe Credit'
            }];

        this.callParent(arguments);
    }
});
