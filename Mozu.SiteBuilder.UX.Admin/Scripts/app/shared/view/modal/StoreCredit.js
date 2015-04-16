Ext.define('Taco.shared.view.modal.StoreCredit', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.data.Store',
        'Ext.grid.plugin.CellEditing',
        'Taco.store.StoreCredits'
    ],
    autoShow: true,
    //width: 900,
    //minHeight:50,
    scale:'large',
    title: 'Gift Cards and Store Credits',
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
        
        this.storeCredits = this.record.getStoreCredits({
        });
        
        me.grid = Ext.create('Taco.view.storeCredit.Grid', {
            title:null,
            enableNavHeader:false,
            launchEditorOnClick: false,
            addContentPadding: false,
            enableSearch: false,
            hideSearchToolbar: true,
            disableContextMenuClick: true,
            enableActionColumn: false,

            // removes the columns that are customer specific since they do not add value in this grid instance.
            excludeCustomerColumns: true,

            store: this.storeCredits,
            //selType: 'cellmodel',
            viewConfig: {
                deferEmptyText: false,
                stripeRows: false,
                emptyText: '<div class="empty-grid-message">No store credits to display</div>'
            }
        });

        this.items = [ me.grid ];

        this.callParent(arguments);
    }
});
