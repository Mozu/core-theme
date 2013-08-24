/**
 * @class Taco.core.ux.browser.ItemBrowser
 * Card panel with two cards containing the same list of items
 */
Ext.define('Taco.core.ux.browser.ItemBrowser', {
    extend: 'Taco.core.ux.BaseCardPanel',
    requires: ['Taco.core.ux.form.ToggleGroup', 'Ext.toolbar.Spacer', 'Taco.core.ux.ComboFilter'],
    alias: 'widget.itembrowser',
    cls: Taco.baseCSSPrefix + 'itembrowser',
    toolbar:null,
    itemStoreId: false,
    filterProperty: 'title',
    // bodyPadding: '12 0 0 0',
    useGridPanel: true,
    useTilePanel: false,

    createItemStore: function() {
        this.itemStore = this.itemStore || Ext.data.StoreManager.lookup(this.itemStoreId);
        return this.itemStore;
    },

    createTopToolbar: function() {
        var me = this,
            conf;
       

        conf = {
            dock: 'top',
            items: [ '->', {
                xtype: 'slider',
                hidden: true,
                width: 100,
                margin: '0 0 0 14',
                value: 230,
                increment: 70,
                minValue: 90,
                maxValue: 230,
                tipText: function (thumb) {
                    var minValue = thumb.slider.minValue,
                        maxValue = thumb.slider.maxValue,
                        thumbNewValue = thumb.slider.getValue(),
                        valueToDisplay;

                    if (thumbNewValue <= minValue) {
                        valueToDisplay = "Small";
                    } else if (thumbNewValue >= maxValue) {
                        valueToDisplay = "Large";
                    } else {
                        valueToDisplay = "Medium";
                    }

                    return valueToDisplay;
                },
                listeners: {
                    change: function (slider, newValue, thumb) {
                        me.tileView = me.tileView || me.down('tileview');
                        me.tileView.changeTileSize(newValue);
                    }
                }
            }, {
                xtype: 'tbspacer',
                flex: 1
            }, {
                xtype: 'tbtext',
                itemId: 'recordCount',
                margin: '0 0 0 14',
                tpl: new Ext.XTemplate([
                        '<div>',
                            '<span class="record-total-count">{totalCount}</span> ',
                            '<span class="record-unit">',
                            '<tpl if="totalCount == 1">{[Ext.util.Inflector.singularize(values.unit)]}<tpl else>{unit}</tpl>',
                            '</span>',
                        '</div>'
                ]),
                data: {
                    count: 0,
                    totalCount: 0,
                    unit: 'records'
                }
            }]
        };
        
        if (me.filterProperties) {
            me.searchBox = Ext.widget({
                xtype: 'taco.combofilter',
                width: 675,
               // value: ['steve'],
                // margin: '20 0',
                itemStore: me.createItemStore(),
                filterForm: me.filterFormConf,
                filterProperties: me.filterProperties
            });
            if (this.options && this.options.query) {
                me.on('afterrender', function () {
                    me.searchBox.setValue([this.options.query]);
                });
            }
            conf.items.unshift(me.searchBox);
        } 
        if (me.useGridPanel && me.useTilePanel) conf.items.push(me.createToggleGroup());
        me.topToolbar = Ext.widget('toolbar', conf);
        return me.topToolbar;
    },

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

    createToggleGroup: function () {
        var me = this;
        me.toggleGroup = Ext.widget('togglegroup', {
            columns: 2,
            vertical: false,
            margin: '0 0 0 10',
            items: [
                { name: 'cardselect', inputValue: '0', fieldCls: 'toggle-gridview', checked: true },
                { name: 'cardselect', inputValue: '1', fieldCls: 'toggle-tileview' }
            ],
            listeners: {
                change: function (group, selected) {
                    var slider = me.toggleGroup.slider = me.toggleGroup.slider || me.down('slider') || null;

                    me.getLayout().setActiveItem(parseInt(selected.cardselect));

                    if (slider && !!(parseInt(selected.cardselect))) {
                        slider.show();
                        me.expanderCollapser && me.expanderCollapser.hide();
                    } else {
                        slider&&slider.hide();
                        me.expanderCollapser && me.expanderCollapser.show();
                    }
                }
            }
        });
        return me.toggleGroup;
    },

    createSecondToolbar: function () {
        var me = this,
            conf;

        conf = {
            dock: 'top',
            border: false,
            weight: 100,
            items: []
        };

        if (this.isCollectionContext && this.gridPanel && this.useGridPanel && this.gridPanel.useMultiGrid) {
            conf.items.push({
                xtype: 'taco.button',
                disabled: true,
                text: 'Bulk Actions',
                handler: function () { console.log('do bulk actions'); }
            }, '->', me.createExpanderCollapser());
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

        me.createItemStore().on({
            load: me.onItemStoreUpdate,
            bulkremove: me.onItemStoreUpdate,
            // datachanged: me.onItemStoreUpdate,
            scope: me
        });

        this.on('afterrender', this.onItemStoreUpdate, this);

        this.callParent(arguments);

        this.relayActionEvents();
    },

    relayActionEvents: function() {
        Ext.Array.each(this.uniquePanels, function(panel) {
            if (panel.getActionEvents) this.relayEvents(panel, panel.getActionEvents());
        });
    },

    onItemStoreUpdate: function (store, records, indexesOrSuccess, isMove) {
        var me = this,
            rc = me.down('#recordCount'),
            netChange, data;

        // if the component has not been rendered yet, we can't update it
        if (!rc) return;

        // if afterrender triggered this function, the first argument is not a store
        store = store.isStore ? store : me.itemStore;

        // if bulkremove triggered this function, totalCount will be out of sync
        netChange = (isMove === false) ? records.length * -1 : 0;

        data = {
            count: store.getCount(),
            totalCount: store.getTotalCount() + netChange,
            unit: me.itemType
        };

        console.log(isMove, data.count, data.totalCount, netChange);

        data.totalCount = data.totalCount > data.count ? data.totalCount : data.count;

        rc.update(data);
        rc.renderData = data;
    },

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