/**
 * @class Taco.view.order.widget.PriceListMenu
 * Menu that contains a list of price lists that can be applied to the order.
 */
Ext.define('Taco.view.order.widget.PriceListMenu', {
    extend: 'Ext.menu.Menu',
    alias: 'widget.taco-pricelistmenu',
    requires: [
        'Taco.model.PriceList',
        'Taco.store.PriceLists'
    ],

    plain: true,

    showSeperator: false,

    config: {
        orderId: null
    },

    store: null,

    initComponent: function (eOpts) {
        var me = this;

        me.initPriceListData();

        me.mon(me, 'show', function(button, menu, eOpts) {
            me.removeAll();

            me.add({
                text: 'Loading...',
                disabled: true
            });

            //get data now!
            me.getPriceListMenu();
        }, me);

        me.items = [
            {
                text: "loading...",
                disabled: true
            }
        ];

        me.callParent(arguments);
    },

    initPriceListData: function() {
        var me = this;
        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.PriceLists');
        /*this.store = Ext.create('Ext.data.Store', {
            model: 'Taco.store.PriceLists',
            autoLoad: false,
            proxy: {
                type: 'ajax',
                url: '/admin/app/priceList/list',
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success'
                }
            }
        });*/
    },

    updatePriceListMenu: function(data) {
        var me = this,
            menuData = [];

        for (var i = 0; i < data.length; ++i) {
            var curData = data[i];
            if (i !== 0) {
                menuData.push({
                    xtype: 'menuseparator',
                    diabled: true
                });
            }
            menuData.push({
                xtype: 'menuitem',
                text: curData.name,
                listeners: {
                    click: {
                        fn: me.onPriceListChange,
                        scope: me,
                        delegate: 'x-menu-item-link'
                    }
                },
                data: curData
            });
        }
        
        if (me.isVisible()) {
            me.removeAll();
            if (menuData.length > 0) {
                // since the length is greater then 0, we want to add a 'None' selection at the end.
                menuData.push({
                    xtype: 'menuseparator',
                    diabled: true
                });
                menuData.push({
                    xtype: 'menuitem',
                    text: 'None',
                    listeners: {
                        click: {
                            fn: me.onPriceListChange,
                            scope: me,
                            delegate: 'x-menu-item-link'
                        }
                    },
                    data: {
                        name: 'None',
                        code: '',
                        isExclusive: false,
                        isDefault: false
                    }
                });
                var added = me.add(menuData);

                added[0].setActive(true);
            } else {
                me.add({
                    text: 'No price lists available',
                    disabled: true
                });
            }

        }
    },

    getPriceListMenu: function () {
        var me = this;
        var menuData = [];

        /*me.store.load({
            callback: function(records, operation, success) {
                if (success) {
                    me.store.each(function(record) {
                        var data = { code: '', name: '', isExclusive: false, isDefault: false };

                        data.code = record.get('code');
                        data.name = record.get('name');
                        data.isExclusive = record.get('filteredInStorefront');
                        //data.isDefault = record.get('isDefault');
                        menuData.add(data);
                    });
                    me.updatePriceListMenu(menuData);
                } else {
                    me.removeAll();
                    me.add({
                        text: 'No price lists available',
                        disabled: true
                    });
                }
            }
        });*/

        me.store.each(function (record) {
            var data = { code: '', name: '', isExclusive: false, isDefault: false };
            var isExclusive = record.get('filteredInStorefront');
            data.code = record.get('code');
            data.name = isExclusive ? record.get('name') + " (Exclusive)" : record.get('name');
            data.isExclusive = isExclusive;
            //data.isDefault = record.get('isDefault');
            menuData.push(data);
        });
        me.updatePriceListMenu(menuData);
    },

    onPriceListChange: function() {
        // implement in calling class!
    }

});