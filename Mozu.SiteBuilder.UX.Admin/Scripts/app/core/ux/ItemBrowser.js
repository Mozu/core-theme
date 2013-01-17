/**
 * @class Taco.core.ux.ItemBrowser
 * Card panel with two cards containing the same list of items
 */
Ext.define('Taco.core.ux.ItemBrowser', {
    extend: 'Taco.core.ux.BaseCardPanel',
    requires: ['Taco.core.ux.form.ToggleGroup', 'Ext.toolbar.Spacer'],
    alias: 'widget.itembrowser',
    cls: Taco.baseCSSPrefix + 'itembrowser',

    itemStoreId: false,
    itemType: 'products',
    filterProperty: 'title',
    bodyPadding: '12 0 0 0',

    initComponent: function () {
        var me = this;
        me.itemStore = me.itemStore || Ext.data.StoreManager.lookup(me.itemStoreId);


        // add a toolbar with filter, summary info, and card switcher
        if (!me.dockedItems || me.dockedItems.length === 0) {
            me.dockedItems = [{
                xtype: 'toolbar',
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
                            var view = this.up('itembrowser').down('tileview');

                            view.changeTileSize(newValue);
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
            }];
        }

        me.itemStore.on({
            load: me.onItemStoreUpdate,
            datachanged: me.onItemStoreUpdate,
            scope: me
        });

        this.callParent(arguments);
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