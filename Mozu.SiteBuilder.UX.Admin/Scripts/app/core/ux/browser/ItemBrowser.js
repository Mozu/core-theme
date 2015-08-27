/**
 * @class Taco.core.ux.browser.ItemBrowser
 * Card panel with two cards containing the same list of items
 */
Ext.define('Taco.core.ux.browser.ItemBrowser', {
    extend: 'Taco.core.ux.BaseCardPanel',
    requires: ['Taco.core.ux.form.ToggleGroup', 'Ext.toolbar.Spacer', 'Taco.core.ux.ComboFilter', 'Taco.core.ux.form.FilterContainer'],
    alias: 'widget.itembrowser',

    cls: Taco.baseCSSPrefix + 'itembrowser',

    itemStoreId: false,
    filterProperty: 'title',
    useGridPanel: true,
    useTilePanel: false,
    
    // array of toolbar items to be added to ths second toolbar below the search toolbar;
    secondToolbarItems : null,

    createItemStore: function() {
        this.itemStore = this.itemStore || Ext.data.StoreManager.lookup(this.itemStoreId);
        return this.itemStore;
    },

    createTopToolbar: function() {
        var me = this;
        var cfg, items;

        cfg = {
            dock: 'top',
            margin: '0 0 10',
            height: 30
        };

        if (me.useGridPanel && me.useTilePanel) {
            items = ['->', me.createToggleGroup()];
        } else {
            items = [];
        }

        if (me.advancedSearchConfig) {
            me.searchBox = Ext.widget({
                xtype: 'taco-filtercontainer',
                width: '100%',
                flex: 1,
                
                quickFilterData: me.advancedSearchConfig.quickFilterData,
                advancedForm: me.advancedSearchConfig.form,
                advancedFormCls: me.advancedSearchConfig.advancedFormCls,
                store: me.createItemStore(),
                filterStores: me.advancedSearchConfig.stores,
                value: this.options && this.options.query ?  this.options.query : undefined 
            });

            items.unshift(me.searchBox);
        } else if (me.filterProperties) {
            Ext.log({
                msg: 'filterProperties deprecated',
                level: 'warn'
            });
        }

        me.topToolbar = Ext.isEmpty(items) ? null : Ext.widget('toolbar', Ext.apply(cfg, { items: items }));
        
        return me.topToolbar;
    },

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

    createToggleGroup: function () {
        var me = this;

        this.toggleGroup = Ext.create('Ext.Container', {
            margin: '0 0 0 10',
            items: [{
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: '',
                glyph: 'XE00C@mozicons',
                toggleGroup: 'gridTileSwitch',
                allowDepress: false,
                enableToggle: true,
                pressed: true,
                scope: this,
                style: {
                    borderRadius: '2px 0px 0px 2px',
                    padding: '6px 8px 6px 9px'
                },
                handler: function () {
                    this.getLayout().setActiveItem(0);
                }
            }, {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: '',
                glyph: 'XE00D@mozicons',
                toggleGroup: 'gridTileSwitch',
                allowDepress: false,
                enableToggle: true,
                scope: this,
                style: {
                    borderRadius: '0px 2px 2px 0px',
                    padding: '7px 9px 5px 9px'
                },
                handler: function () {
                    this.getLayout().setActiveItem(1);
                },
                toggleHandler: function (cmp, isPressed) {
                    if (this.expanderCollapser) {
                        this.expanderCollapser.setVisible(!isPressed);
                    }
                }
            }]
        });
        // me.toggleGroup = Ext.widget('togglegroup', {
        //     columns: 2,
        //     vertical: false,
        //     width:60,
        //     margin: '0 0 0 10',
        //     items: [
        //         { name: 'cardselect', inputValue: '0', fieldCls: 'toggle-gridview', checked: true },
        //         { name: 'cardselect', inputValue: '1', fieldCls: 'toggle-tileview' }
        //     ],
        //     listeners: {
        //         change: function (group, selected) {
        //             var slider = me.toggleGroup.slider = me.toggleGroup.slider || me.down('slider') || null;

        //             me.getLayout().setActiveItem(parseInt(selected.cardselect));

        //             if (slider && !!(parseInt(selected.cardselect))) {
        //                 slider.show();
        //                 me.expanderCollapser && me.expanderCollapser.hide();
        //             } else {
        //                 slider&&slider.hide();
        //                 me.expanderCollapser && me.expanderCollapser.show();
        //             }
        //         }
        //     }
        // });

        return me.toggleGroup;
    },

    createSecondToolbar: function () {
        var me = this,
            conf;

        conf = {
            dock: 'top',
            margin: '0 0 10',
            height: 30,
            border: false,
            weight: 100,
            items: []
        };

        if (this.isCollectionContext && this.gridPanel && this.useGridPanel && this.gridPanel.useMultiGrid) {
            /*conf.items.push({
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                disabled: true,
                text: 'Bulk Actions',
                handler: function () { console.log('do bulk actions'); }
            }, '->', me.createExpanderCollapser());*/
        }
        
        if (this.secondToolbarItems && this.secondToolbarItems.length > 0) {
            var tbItems = this.secondToolbarItems.concat(conf.items);
            conf.items = tbItems;
        }
        
        me.secondToolbar = conf.items.length > 0 ? Ext.widget('toolbar', conf) : null;

        return me.secondToolbar;
    },

    constructor: function (conf) {
        var panels = [];
        if (conf.gridPanel && (conf.useGridPanel || this.useGridPanel)) panels.push(conf.gridPanel);
        if (conf.tilePanel && (conf.useTilePanel || this.useTilePanel)) panels.push(conf.tilePanel);
        conf.uniquePanels = panels;
        this.callParent([conf]);
    },

    initComponent: function () {
        var me = this;
        
        if (!me.dockedItems || me.dockedItems.length === 0) me.dockedItems = [me.createTopToolbar(), me.createSecondToolbar()];

        //me.createItemStore().on({
        //    load: me.onItemStoreUpdate,
        //    bulkremove: me.onItemStoreUpdate,
        //    // datachanged: me.onItemStoreUpdate,
        //    scope: me
        //});
        
        //this.on('afterrender', this.onItemStoreUpdate, this);

        this.callParent(arguments);

        this.relayActionEvents();
    },

    relayActionEvents: function() {
        Ext.Array.each(this.uniquePanels, function(panel) {
            if (panel.getActionEvents) this.relayEvents(panel, panel.getActionEvents());
        });
    },

    //onItemStoreUpdate: function (store, records, indexesOrSuccess, isMove) {
    //    var me = this,
    //        rc = me.down('#recordCount'),
    //        netChange, data,
    //        unitLabel;
        
    //    // if the component has not been rendered yet, we can't update it
    //    if (!rc) return;

    //    // if afterrender triggered this function, the first argument is not a store
    //    store = store.isStore ? store : me.itemStore;

    //    // if bulkremove triggered this function, totalCount will be out of sync
    //    netChange = (isMove === false) ? records.length * -1 : 0;
    //    if (me.gridHeaderLabel) {
    //        if (records && records.length > 0) {
    //            unitLabel = Ext.util.Inflector.pluralize(me.gridHeaderLabel);
    //        } else {
    //            unitLabel = me.gridHeaderLabel;
    //        }
            
    //    } else {
    //        unitLabel = me.itemType;
    //    }
    //    data = {
    //        count: store.getCount(),
    //        totalCount: store.getTotalCount() + netChange,
    //        unit: unitLabel
    //    };

    //    data.totalCount = data.totalCount > data.count ? data.totalCount : data.count;

    //    rc.update(data);
    //    rc.renderData = data;
    //},

    onKeyUp: function (field) {
        var me = this,
         value = field.getValue(),
            store = me.itemStore;
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