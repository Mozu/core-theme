Ext.define('Taco.view.entityManager.SchemaList', {
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
        
        this.store = Ext.create('Taco.store.EntityLists', {
            entityType: this.entityType,
            autoLoad: true,
            listeners: {
                load: this.selectFirstItem.bind(this)
            }
        })

        this.columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'name',
                stateId: 'name',
                minWidth: 100,
                text: 'Schema Name',
                flex: 2,
                sortable: true
            }
        ];

        this.seleModel =  this.getSelectionModel();

        this.seleModel.on('selectionchange', this.handleSelection, this);

        this.callParent(arguments);
    },

    selectFirstItem: function() {
        if (this.autoSelectFirstItem) {
            this.seleModel.select(this.store.getAt(0));
        }
    },

    handleSelection: function(cmp, record) {
        this.entitySplit = this.entitySplit || this.up('entity-split');
        this.dynamicGrid = this.dynamicGrid || this.entitySplit.down('#dymanicEnityGrid');

        if (this.entitySplit) {
            this.entitySplit.enableButtons();
            this.entitySplit.updateSearchContext();
            this.cardPanel = this.entitySplit.down('#dynamicGridHolder');
            this.cardPanel.getLayout().setActiveItem(0);
        }

        if (this.dynamicGrid) {
            this.dynamicGrid.initListView(record[0]);
        }
    }


});
