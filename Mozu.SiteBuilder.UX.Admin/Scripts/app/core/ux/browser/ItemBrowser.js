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

    setItemStore: function() {
        this.itemStore = this.itemStore || Ext.data.StoreManager.lookup(this.itemStoreId);
    },

    createTopToolbar: function() {
        var me = this, conf = {
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
            }, {
                xtype: 'togglegroup',
                hidden: me.uniquePanels.length === 1,
                columns: 2,
                vertical: false,
                margin: '0 5 0 10',
                items: [
                    { name: 'cardselect', inputValue: '0', fieldCls: 'toggle-gridview', checked: true },
                    { name: 'cardselect', inputValue: '1', fieldCls: 'toggle-iconview' }
                ],
                listeners: {
                    change: function (group, selected) {
                        var slider = me.down('slider') || null;

                        me.getLayout().setActiveItem(parseInt(selected.cardselect));

                        if (slider && !!(parseInt(selected.cardselect))) {
                            me.down('slider').show();
                        } else if (slider) {
                            me.down('slider').hide();
                        }
                    }
                }
            }]
        }
        me.topToolbar = Ext.widget('toolbar',);
        if (me.uniquePanels.length === 1) 
        return me.topToolbar;
    },

    createExpanderCollapser: function() {
        me.expanderCollapser = Ext.widget('component', {
            html: '<a href="#" class="' + Taco.baseCSSPrefix + 'itembrowser-expandall">expand all</a>&nbsp;|&nbsp;<a href="#" class="' + Taco.baseCSSPrefix + 'itembrowser-collapseall">collapse all</a>'
        });
        return me.expanderCollapser;
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
        if (this.isCollectionContext) conf.items.push('->', me.createExpanderCollapser());
        me.secondToolbar = Ext.widget('toolbar', conf);
        return me.secondToolbar;
    },

    initComponent: function () {
        var me = this;

        // add a toolbar with filter, summary info, and card switcher
        if (!me.dockedItems || me.dockedItems.length === 0) {
            me.dockedItems = [me.topToolbar,
            {
                
            }];
        }

        me.itemStore.on({
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