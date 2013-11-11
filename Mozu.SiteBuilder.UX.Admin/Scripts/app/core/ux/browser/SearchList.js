/**
 * @class Taco.core.ux.browser.SearchList
 * Simple grid panel with search. 
 */
Ext.define('Taco.core.ux.browser.SearchList', {
    extend: 'Taco.core.ux.grid.Panel',
    
    mixins: {
        pageable: 'Taco.core.ux.mixins.Pageable',
        searchable: 'Taco.core.ux.mixins.Searchable',
        rowEditable: 'Taco.core.ux.mixins.RowEditable'
    },
    
    alias: 'widget.searchlist',
    
    cls: Taco.baseCSSPrefix + 'itembrowser',
    
    toolbar: null,
    
    filterProperty: 'title',
    
    gridHeaderLabel: "Items",
    
    enableSearch: true,

    // store: { type: 'Taco.store.InventoryProducts' },
    store: null,
    
    // array of toolbar items to be added to ths second toolbar below the search toolbar;
    secondToolbarItems: null,
    
    // meant to be overriden by the subclass;
    columns: [
        {
            dataIndex: 'id',
            text: 'Id',
            width: 100
        }, {
            dataIndex: 'name',
            text: 'Name',
            flex:1
        }
    ],
    
    
    initComponent: function () {
        var me = this;

        if (!me.store) {
            console.log("store configuration is required.  Example store: { type: 'Taco.store.InventoryProducts' } ");
            return;
        } else {
            me.store = Taco.core.data.StoreManager.getOrCreate(me.store);
        }
        
        me.columns = Ext.clone(me.columns);
        
        me.store.on({
            load: me.onItemStoreUpdate,
            bulkremove: me.onItemStoreUpdate,
            scope: me
        });

        me.on('afterrender', this.onItemStoreUpdate, this);
        
        me.dockedItems = me.dockedItems || [];

        this.mixins.rowEditable.constructor.apply(this, arguments);
        
        // initialize the search toolbar mixin
        this.mixins.searchable.constructor.apply(this, arguments);
        me.dockedItems.push(me.createSearchToolbar());
        
        if (me.secondToolbarItems) {
            me.dockedItems.push(me.createSecondToolbar());
        }



        

        // initialize the grid paging toolbar mixin
        this.mixins.pageable.constructor.apply(this, arguments);
        
        this.callParent(arguments);
        
        
    },

    
    // todo: move this to an expandable mixin;n
    createExpanderCollapser: function () {
        var me = this;

        me.expanderCollapser = Ext.create('Ext.Container', {
            height: 30,
            cls: Taco.baseCSSPrefix + 'expandercollapser',
            layout: { type: 'hbox', align: 'middle' },
            items: [{
                xtype: 'action',
                text: 'Expand All',
                click: function () { me.gridPanel.findPlugin('rowexpander').expandAllRows(true); }
            }, {
                xtype: 'action',
                text: 'Collapse All',
                click: function () { me.gridPanel.findPlugin('rowexpander').expandAllRows(false); }
            }]
        });

        return me.expanderCollapser;
    },
    
    createSecondToolbar: function () {
        var me = this,
            conf;

        conf = {
            dock: 'top',
            border: false,
            //weight: 100,
            items: []
        };

        if (this.isCollectionContext && this.gridPanel && this.useGridPanel && this.gridPanel.useMultiGrid) {
            conf.items.push({
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                disabled: true,
                text: 'Bulk Actions',
                handler: function () { console.log('do bulk actions'); }
            }, '->', me.createExpanderCollapser());
        }
        
        if (this.secondToolbarItems && this.secondToolbarItems.length > 0) {
            var tbItems = this.secondToolbarItems.concat(conf.items);
            conf.items = tbItems;
        }
        
        me.secondToolbar = conf.items.length > 0 ? Ext.widget('toolbar', conf) : null;

        return me.secondToolbar;
    },
    
    onItemStoreUpdate: function (store, records, indexesOrSuccess, isMove) {
        var me = this,
            rc = me.down('#recordCount'),
            netChange, data,
            unitLabel;
        
        // if the component has not been rendered yet, we can't update it
        if (!rc) return;

        // if afterrender triggered this function, the first argument is not a store
        store = store.isStore ? store : me.store;

        // if bulkremove triggered this function, totalCount will be out of sync
        netChange = (isMove === false) ? records.length * -1 : 0;
        if (me.gridHeaderLabel) {
            if (records && records.length > 0) {
                unitLabel = Ext.util.Inflector.pluralize(me.gridHeaderLabel);
            } else {
                unitLabel = me.gridHeaderLabel;
            }
            
        } else {
            unitLabel = me.itemType;
        }
        data = {
            count: store.getCount(),
            totalCount: store.getTotalCount() + netChange,
            unit: unitLabel
        };

        data.totalCount = data.totalCount > data.count ? data.totalCount : data.count;

        rc.update(data);
        rc.renderData = data;
    },

    onKeyUp: function (field) {
        var me = this,
            value = field.getValue(),
            store = me.store;
        
        store.currentPage = 1;
     
        if (value.length == 0) {
            store.filters.removeAtKey(this.id);

            store.load();
            return;
        }
        if (value.length >= 3) {
            store.filters.add(this.id, Ext.create('Ext.util.Filter', {
                anyMatch: true,
                property: me.filterProperty,
                value: value,
                root: 'data'
            }));
            store.load();
        }
    }
});