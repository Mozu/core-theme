Ext.define('Taco.view.report.ReportList', {
    extend: 'Taco.core.ux.grid.Panel',

    requires: [
        'Taco.store.Reports'
    ],

    height: '100%',
    isRootHeader: false,
    enablePaging: true,
    menuDisabled: true,
    enableColumnHide: false,
    enableColumnMove:false,
    store: {
        type: 'Taco.store.Reports'
    },

    initComponent: function () {

        this.store = Ext.create('Taco.store.Reports', {
            autoLoad: true,
            listeners: {
                load: this.selectFirstItem.bind(this)
            }
        });

        this.columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'name',
                stateId: 'name',
                minWidth: 100,
                text: "Name",
                flex: 2
            }
        ];

        this.selModel = this.getSelectionModel();

        this.selModel.on('selectionchange', this.handleSelection, this);

        this.on('cellclick', this.showReportView, this);

        this.callParent(arguments);
    },

    showReportView: function () {
        this.reportSplit = this.reportSplit || this.up('reports-split');
        this.cardPanel = this.reportSplit.down('#reportHolder');
        this.cardPanel.getLayout().setActiveItem(0);
    },

    selectFirstItem: function () {
        this.handleSelection(null, [this.store.getAt(0)]);
    },

    handleSelection: function (cmp, records) {
        var me = this;
        me.reportSplit = me.reportSplit || me.up('reports-split');
       

        if (me.reportSplit && records && records.length > 0 ) {
            this.reportSplit.getEast().expand();
            me.reportSplit.setReportId(records[0].data.chartioId);
        }
   },

    clearSelection: function () {
        this.selModel.deselectAll();
    }


});
