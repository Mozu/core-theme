/**
 * @class Taco.core.ux.browser.ItemBrowser
 * Card panel with two cards containing the same list of items
 */
Ext.define('Taco.core.ux.browser.ItemBrowser', {
    extend: 'Taco.core.ux.BaseCardPanel',
    requires: ['Taco.core.ux.form.ToggleGroup', 'Ext.toolbar.Spacer'],
    alias: 'widget.itembrowser',
    cls: Taco.baseCSSPrefix + 'itembrowser',

    itemStoreId: false,
    filterProperty: 'title',
    bodyPadding: '12 0 0 0',
    useGridPanel: true,
    useTilePanel: true,

    createItemStore: function() {
        this.itemStore = this.itemStore || Ext.data.StoreManager.lookup(this.itemStoreId);
        return this.itemStore;
    },

    createTopToolbar: function() {
        var me = this,
            conf;

        conf = {
            dock: 'top',
            items: [{
                xtype: 'textfield',
                flex: 2,
                emptyText: 'Search products',
                enableKeyEvents: true,
                listeners: {
                    'keyup': {
                        fn: me.onKeyUp,
                        scope: me
                    }
                }
            }, '->', {
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
                            '<span class="record-unit">{unit}</span>',
                        '</div>'
                ]),
                data: {
                    count: 0,
                    totalCount: 0,
                    unit: 'records'
                }
            }]
        };
        if (me.useGridPanel && me.useTilePanel) conf.items.push(me.createToggleGroup());
        me.topToolbar = Ext.widget('toolbar', conf);
        return me.topToolbar;
    },

    createExpanderCollapser: function () {
        var me = this,
            expandCls = Taco.baseCSSPrefix + 'itembrowser-expandall',
            collapseCls = Taco.baseCSSPrefix + 'itembrowser-collapseall';
        var me = this;
        me.expanderCollapser = Ext.widget('component', {
            html: '<a href="javascript;" class="' + expandCls + '">expand all</a>&nbsp;|&nbsp;<a href="javascript;" class="' + collapseCls + '">collapse all</a>',
            renderSelectors: {
                expandEl: 'a.' + expandCls,
                collapseEl: 'a.' + collapseCls
            },
            afterRender: function () {
                me.expanderCollapser.expandEl.on('click', me.gridPanel.expandAllRows, me.gridPanel);
                me.expanderCollapser.collapseEl.on('click', function () {
                    me.gridPanel.expandAllRows(false);
                });
            }
        });

        return me.expanderCollapser;
    },

    createToggleGroup: function() {
        var me = this;
        me.toggleGroup = Ext.widget('togglegroup', {
            columns: 2,
            vertical: false,
            margin: '0 5 0 10',
            items: [
                { name: 'cardselect', inputValue: '0', fieldCls: 'toggle-gridview', checked: true },
                { name: 'cardselect', inputValue: '1', fieldCls: 'toggle-iconview' }
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
        var me = this;
        var conf = {
            dock: 'top',
            weight: 100,
            items: [
                // placeholder for Bulk Actions button
            ]
        };
        if (this.isCollectionContext && this.gridPanel && this.useGridPanel && this.useMultiGrid) conf.items.push('->', me.createExpanderCollapser());
        me.secondToolbar = Ext.widget('toolbar', conf);
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
            datachanged: me.onItemStoreUpdate,
            scope: me
        });

        this.callParent(arguments);

        this.relayActionEvents();
    },

    relayActionEvents: function() {
        Ext.Array.each(this.uniquePanels, function(panel) {
            if (panel.getActionEvents) this.relayEvents(panel, panel.getActionEvents());
        });
    },

    onItemStoreUpdate: function () {
        var me = this,
        data = {
            count: me.itemStore.getCount(),

            totalCount: me.itemStore.getTotalCount(),
            unit: me.itemType
        };

        data.totalCount = data.totalCount > data.count ? data.totalCount : data.count;
        if (me.down('#recordCount')) {
            me.down('#recordCount').update(data);
        }
    },

    onKeyUp: function (field) {
        var me = this,
        store = me.itemStore;
        store.currentPage = 1;
        if (!field || !(value in field)) return;
        if (field.value.length == 0) {
            store.filters.removeAtKey(this.id);

            store.load();
            return;
        }
        if (field.value.length >= 3) {
            store.filters.add(this.id, Ext.create('Ext.util.Filter', {
                anyMatch: true,
                property: me.filterProperty,
                value: field.getValue(),
                root: 'data'
            }));
            store.load();
        }
    }
});