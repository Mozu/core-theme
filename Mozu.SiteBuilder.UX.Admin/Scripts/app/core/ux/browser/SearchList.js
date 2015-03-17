/**
 * @class Taco.core.ux.browser.SearchList
 * Simple grid panel with search. 
 */

Ext.define('Taco.core.ux.browser.SearchList', {
    extend: 'Taco.core.ux.grid.Panel',
    requires: ['Taco.core.ux.grid.plugins.AutoSelect'],
    mixins: {
        launcheditor: 'Taco.core.ux.mixins.LaunchEditor',
        navHeader: 'Taco.core.ux.mixins.NavHeader',
        pageable: 'Taco.core.ux.mixins.Pageable',
        searchable: 'Taco.core.ux.mixins.Searchable',
        rowEditable: 'Taco.core.ux.mixins.RowEditable',
        deleteFromGrid : 'Taco.core.ux.mixins.DeleteFromGrid'
    },

    alias: 'widget.searchlist',

    //cls: Taco.baseCSSPrefix + 'itembrowser',
    //cls: Taco.baseCSSPrefix + 'content-view',

    toolbar: null,

    launchEditorOnClick: false,

    filterProperty: 'title',

    gridHeaderLabel: "Items",

    enableNavHeader: false,
    // grids with navHeader `enabled will need extra content padding. Class will be assigned in the navHeader mixin.
    addContentPadding: false,

    enableSearch: true,
    
    enablePaging: true,
    
    hideSearchToolbar: false,

    enableAutoSelect: true,

    // store: { type: 'Taco.store.InventoryProducts' },
    store: null,
    
    // array of toolbar items to be added to ths second toolbar below the search toolbar;
    secondToolbarItems: null,

    disableContextMenuClick :false,
    
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
        
        me.columns = Ext.clone(me.columns);

        if (me.enableNavHeader) {
            //**************************
            // this will add padding around the panel with this mixin;
            // need to put this into a scss class;
            Ext.apply(this,{
                //style: "border-width: 0px;background-color: #e6e6e6;",
                //padding: "20 20 10 20"
            })
            //**************************
        }
        
        // this plugin will auto select the first record in the grid and manage reselection of the selected item after a store load
        if (this.enableAutoSelect !== false) {            
            this.plugins = this.plugins || [];
            this.plugins.push(Ext.create('Taco.core.ux.grid.plugins.AutoSelect'));
        }

        // Initialize the LaunchEditor Mixin Defined in SearchList 
        if (this.launchEditorOnClick) {
            //initialize the content navigation toolbar.
            this.mixins.launcheditor.constructor.apply(this);
        }

        if (!me.store) {
            throw("store configuration is required.  Example store: { type: 'Taco.store.InventoryProducts' } ");
            return;
        } else {
            me.store = Taco.core.data.StoreManager.getOrCreate(me.store);

        }
        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);


        
        /*
        // this is deprecated since the toolbar now showing the item count
        me.store.on({
            load: me.onItemStoreUpdate,
            bulkremove: me.onItemStoreUpdate,
            scope: me
        });
        me.on('afterrender', this.onItemStoreUpdate, this);
        */


        me.dockedItems = me.dockedItems || [];
        
        if (me.enableNavHeader) {
            //initialize the content navigation toolbar.
            this.mixins.navHeader.init.apply(this);
        } 

        this.mixins.rowEditable.constructor.apply(this);
        
        // initialize the search toolbar mixin
        if (me.enableSearch) {
            this.mixins.searchable.constructor.apply(this);
            me.dockedItems.push(me.createSearchToolbar());
        }
        
        if (me.secondToolbarItems) {
            me.dockedItems.push(me.createSecondToolbar());
        }
        
        if (me.enablePaging) {
            // initialize the grid paging toolbar mixin
            this.mixins.pageable.constructor.apply(this);
        }
        
        
        this.callParent(arguments);
        
        
        // add right click menu to grid that pulls its data from the actions menuColumn;
        var menuColumns = Ext.Array.filter(me.columns, function (col) { return col.isXType && col.isXType('taco.menucolumn'); });        
        if (me.disableContextMenuClick !== true && menuColumns && menuColumns.length == 1) {

            me.mon(me.view, 'itemcontextmenu', function (cmp, record, item, index, e) {
                var eventData = {
                    grid: cmp.ownerCt,
                    rowIndex: index,
                    header: menuColumns[0],
                    e: e,
                    record: record,
                    item: item
                },
                    menu = menuColumns[0].getMenu(eventData);

                menu.on('hide', function () {
                    // need to clear and reselect to get focus set after menu closes;
                    // deselect old record
                    me.getSelectionModel().deselect(record);
                    //reselect old record
                    me.getSelectionModel().select(record, false, false);
                }, me)



                //e.preventDefault();
                e.stopEvent();
                menu.showAt(e.xy);
            }, me);

        }

    },

    // todo: move this to an expandable mixin;n
    createExpanderCollapser: function () {
        var me = this;

        me.expanderCollapser = Ext.create('Ext.Container', {
            height: 30,
            cls: Taco.baseCSSPrefix + 'expandercollapser',
            layout: { type: 'hbox', align: 'middle' },
            items: [{
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: 'Expand All',
                handler: function () { me.gridPanel.findPlugin('rowexpander').expandAllRows(true); }
            }, {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: 'Collapse All',
                handler: function () { me.gridPanel.findPlugin('rowexpander').expandAllRows(false); }
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
    }
});