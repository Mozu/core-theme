/**
 * @class Taco.core.ux.browser.SearchList
 * Simple grid panel with search.
 */

Ext.define('Taco.core.ux.browser.SearchList', {
    extend: 'Taco.core.ux.grid.Panel',
    requires: ['Taco.core.ux.grid.plugins.AutoSelect', 'Taco.core.ux.mixins.PageablePageless'],
    mixins: {
        launcheditor: 'Taco.core.ux.mixins.LaunchEditor',
        navHeader: 'Taco.core.ux.mixins.NavHeader',
        pageable: 'Taco.core.ux.mixins.Pageable',
        searchable: 'Taco.core.ux.mixins.Searchable',
        rowEditable: 'Taco.core.ux.mixins.RowEditable',
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid',
        gridcontextmenu: 'Taco.core.ux.mixins.GridContextMenu'
    },

    alias: 'widget.searchlist',

    //cls: Taco.baseCSSPrefix + 'itembrowser',
    //cls: Taco.baseCSSPrefix + 'content-view',

    toolbar: null,

    launchEditorOnClick: true,

    filterProperty: 'title',

    gridHeaderLabel: 'Items',

    enableSearchBarInHeader: true,

    enableNavHeader: false,

    hideNavMenu: false,

    // grids with navHeader `enabled will need extra content padding. Class will be assigned in the navHeader mixin.
    addContentPadding: false,

    enableSearch: true,

    enablePaging: true,

    hideSearchToolbar: false,

    enableAutoSelect: false,

    // store: { type: 'Taco.store.InventoryProducts' },
    store: null,

    // array of toolbar items to be added to ths second toolbar below the search toolbar;
    secondToolbarItems: null,

    disableContextMenuClick: false,

    deleteItemMsg: null,

    // meant to be overriden by the subclass;
    columns: [
        {
            dataIndex: 'id',
            text: 'Id',
            width: 100
        }, {
            dataIndex: 'name',
            text: 'Name',
            flex: 1
        }
    ],

    listeners: {
        beforecellmousedown: function (cmp, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            tr.className += ' taco-grid-row-active';
        },
        beforecellmouseup: function (cmp, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            tr.className = tr.className.replace('taco-grid-row-active', '');
        },
    },

    initComponent: function () {
        var me = this;
        this.viewConfig = this.viewConfig || {}


        if (this.deferEmptyText !== undefined) {
            this.viewConfig.deferEmptyText = this.deferEmptyText;
        }

        if (this.emptyText !== undefined) {
            this.viewConfig.emptyText = this.emptyText;
        }

        me.columns = Ext.clone(me.columns);

        // this plugin will auto select the first record in the grid and manage reselection of the selected item after a store load
        if (this.enableAutoSelect !== false) {
            this.plugins = this.plugins || [];
            this.plugins.push(Ext.create('Taco.core.ux.grid.plugins.AutoSelect'));
        }

        // Initialize the LaunchEditor Mixin Defined in SearchList
        if (this.launchEditorOnClick) {
            //initialize the content navigation toolbar.
            this.mixins.launcheditor.constructor.apply(this);
            this.addCls('taco-action-on-click');
        }

        if (!me.store) {
            throw ("store configuration is required.  Example store: { type: 'Taco.store.InventoryProducts' } ");
            return;
        } else {
            if (!me.store.isStore) {
                me.store = Taco.core.data.StoreManager.getOrCreate(me.store);
            }
        }
        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);

        me.dockedItems = me.dockedItems || [];

        if (me.enableNavHeader) {
            //initialize the content navigation toolbar.
            this.mixins.navHeader.init.apply(this, {
                enableSearchBarInHeader: me.enableSearchBarInHeader,
                showTitleBorder: me.showTitleBorder
            });
        }

        

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

        this.mixins.rowEditable.constructor.apply(this);
        //this.mixins.gridcontextmenu.constructor.apply(this);

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
                handler: function () { }
            }, '->', me.createExpanderCollapser());
        }

        if (this.secondToolbarItems && this.secondToolbarItems.length > 0) {
            var tbItems = this.secondToolbarItems.concat(conf.items);
            conf.items = tbItems;
        }

        me.secondToolbar = conf.items.length > 0 ? Ext.widget('toolbar', conf) : null;

        return me.secondToolbar;
    },


    destroyMenuColumnHandler: function (item, eventData) {
        var grid = eventData.grid,
            record = eventData.record;


        Ext.MessageBox.show({
            title: 'Delete',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: this.deleteItemMsg ? this.deleteItemMsg :  "Are you sure you want to delete this?",
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function (val) {
                if (val === 'yes') {

                    var store = grid.getStore();
                    grid.setLoading(true);
                    store.remove(record);
                    store.sync({
                        success: function (m) {
                            grid.setLoading(false);
                        },
                        failure: function (m) {
                            store.reload();
                            grid.setLoading(false);

                            var text = "Unknown error.";
                            if (m.exceptions && Taco.core.util.ExceptionWhiner.wasHandled(m.exceptions)) {
                                return;
                            }
                            if (m.exceptions) {
                                text = Taco.core.util.ExceptionWhiner.createHtmlList(m.exceptions);
                            }

                            Taco.app.fireEvent('setmessage', text, 'error');

                        }

                    });
                }
            }
        });

    }
});
