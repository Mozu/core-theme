Ext.define('Taco.view.customSchema.SchemaList', {
    extend: 'Taco.core.ux.grid.Panel',
    
    requires: [
        'Taco.store.EntityLists'
    ],

    height: '100%',
    isRootHeader: false,
    enablePaging: true,
    store: { 
        type: 'Taco.store.EntityLists' 
    },
    entityType: '',

    initComponent: function() {

        var columnsNames = {
            mzdb: 'Entity Lists',
            cms: 'Document Lists'
        };
        
        this.store = Ext.create('Taco.store.EntityLists', {
            entityType: this.entityType,
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
                text: columnsNames[this.entityType],
                flex: 2,
                sortable: true
            }
        ];

        this.selModel =  this.getSelectionModel();

        this.selModel.on('selectionchange', this.handleSelection, this);

        this.on('cellclick', this.showGridView, this);

        this.callParent(arguments);
    },

    showGridView: function() {
        this.entitySplit = this.entitySplit || this.up('entity-split');
        this.entitySplit.getEast().expand();
        this.cardPanel = this.entitySplit.down('#dynamicGridHolder');
        this.cardPanel.getLayout().setActiveItem(0);
    },

    selectFirstItem: function() {
        if (this.autoSelectFirstItem) {
            this.handleSelection(null, [this.store.getAt(0)]);
        }
    },

    handleSelection: function(cmp, record) {
        this.entitySplit = this.entitySplit || this.up('entity-split');
        this.dynamicGrid = this.dynamicGrid || this.entitySplit.down('#dymanicEnityGrid');

        if (this.entitySplit) {
            this.entitySplit.enableButtons();
            this.entitySplit.updateSearchContext();
        }

        if (this.dynamicGrid && record && record.length > 0) {
            this.dynamicGrid.initListView(record[0]);
        }
    },

    clearSelection: function() {
        this.selModel.deselectAll();
    }


});
