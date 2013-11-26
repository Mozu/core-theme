Ext.define('Taco.shared.view.modal.StoreCredit', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.data.Store',
        'Taco.store.StoreCredits'
    ],
    autoShow: true,
    width: 900,
    title: 'Store Crdit',
    formCfg: null,
    closable: true,
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

        me.storeCreditStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.StoreCredits');
        me.storeCreditStore.load();
        me.wishlistGrid = Ext.create('Ext.grid.Panel', {
            store: this.storeCreditStore,
            columns: [
                { text: 'Code', dataIndex: 'code'},
                { text: 'Date Issued', dataIndex: 'dateIssued'},
                { text: 'Amount', dataIndex: 'amount'},
                { text: 'Issued By', dataIndex: 'issuedBy'},
                { text: 'Expires', dataIndex: 'expires' },
                { text: 'Balance', dataIndex: 'balance'}
            ],
            scope: this
        });

        this.items = [me.wishlistGrid];

        this.callParent(arguments);
    }
});
