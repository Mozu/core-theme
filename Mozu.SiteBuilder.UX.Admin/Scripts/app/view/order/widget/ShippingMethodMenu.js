/**
 * @class Taco.view.order.widget.ShippingMethodMenu
 * menu that contains a list of configured shipping methods with flyouts for the full list of shipping methods by carrier;
 */
Ext.define('Taco.view.order.widget.ShippingMethodMenu', {
    extend: 'Ext.menu.Menu',
    alias: 'widget.taco-shippingmethodmenu',
    requires: [
        'Taco.model.ShippingMethod',
        'Taco.store.ShippingMethods'
    ],

    plain: true,

    showSeparator: false,

    config: {
        orderId: null,
        isDraft: false,

        showMethodsByCarrier:false,

        // calls the runtime service to get the pricing for configured shipping methods. Note: it applies to the entire order not a specific package, so it is not appropriate for use in the order fulfillment package class;
        showRuntimePricing: false
    },

    initComponent: function (eOpts) {
        var me = this;

        me.InitShippingMethodsData();


        // this is the shipping methods that are available for the specific order. Will include pricing.
        this.runtimeShippingMethodsStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.ShippingMethod',
            autoLoad: false,
            proxy: {
                type: 'ajax',
                url: '/admin/app/order/shipping/runtimemethods?orderId=' + me.getOrderId() + '&draft=' + me.getIsDraft(),
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success'
                }
            }
        });

        me.mon(me, 'show', function (button, menu, eOpts) {
            
            me.removeAll();
            me.add({
                text: "loading..."
            });

            
            if (me.showRuntimePricing) {
                // need to wait for the runtime data to reload before rebuilding menu;
                this.getRuntimePricing();
            } else {
                // just show the menu no need to wait for pricing;
                this.updateShippingMethodMenu()
            }
            me.addCls('taco-shipping-menu');
        }, me);
        
        me.mon(me, {
            click: {
                fn: me.onShippingMethodChange,
                scope: me,
                delegate: "x-menu-item-link"
            }
        })

        me.items = [{
            text: "loading..."
            }
        ];
        me.callParent(arguments);
    },
    
    onShippingMethodChange: function () {
        
    },

    getRuntimePricing : function (){
        var me = this;

        // need to wait for the runtime service to return order specific shipping pricing.
        if (me.showRuntimePricing) {

            me.runtimeRates = null;            

            if (!me.runtimeRequestActive) {

                me.runtimeRequestActive = true;

                this.runtimeShippingMethodsStore.load({
                    callback: function (records, operaiton, success) {
                        me.runtimeRequestActive = false;
                        if (success) {
                            me.runtimeRates = []
                            // need to process the runtime rates and convert them into menu consumable data;
                            this.runtimeShippingMethodsStore.each(function (record) {
                                var itemConfig = Ext.clone(record.data);
                                itemConfig.text = itemConfig.shippingMethodName + "<span class='taco-shippingmethod-price'>" + Taco.app.context.getCurrent().formatCurrency(itemConfig.price) + "</span>";
                                // remove the id from the data as it will cause conflicts between the duplicated items when they are configured;
                                delete itemConfig.id;
                                me.runtimeRates.push(Ext.clone(itemConfig));
                            })                            
                            this.updateShippingMethodMenu();
                        } else {
                            //Taco.app.fireEvent('setmessage', "No shipping methods available", 'error');
                            me.runtimeRates = [];
                            me.add({
                                text: "No shipping methods available"
                            });
                            //this.hide();
                        }
                        me.runtimeRequestActive = false;
                    },
                    scope: this
                });
            }
        } else {
            this.updateShippingMethodMenu();
        }
    },

    updateShippingMethodMenu: function () {
        var me = this,
            menuData = me.getShippingRatesMenu();
            
        
        // check to make sure the menu wasn't closed while the request was out;
        if (me.isVisible()) {

            me.removeAll();

            if (menuData && menuData.length) {
                var added = me.add(menuData);
                // need to make the first item get focus;
                added[0].setActive(true);
            } else {
                
                //Taco.app.fireEvent('setmessage', "No shipping methods available", 'error');                
                me.add({
                    text: "No shipping methods available"
                });
            }
        }
    },

    InitShippingMethodsData: function () {
        var me = this,
            configuredRatesMenuData = [],
            customConfiguredRatesMenuData = [],
            rateProviders = {}, // Will add providers dynamically
            store = Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingMethods');

        me.configuredRatesMenuData = configuredRatesMenuData;
        me.customConfiguredRatesMenuData = customConfiguredRatesMenuData;
        me.rateProviders = rateProviders;

        if (store) {
            store.each(function (record) {
                var isConfigured = record.get("isConfigured"),
                    itemConfig = Ext.clone(record.data);
                itemConfig.text = Ext.clone(itemConfig.name);

                // remove the id from the data as it will cause conflicts between the duplicated items when they are configured;
                delete itemConfig.id;

                if (record.get("rateProvider") == 'custom') {
                    customConfiguredRatesMenuData.push(itemConfig)
                } else {
                    if (isConfigured) {
                        // clone the config so that any subsequent changes dont' leak in to the configured config                        
                        configuredRatesMenuData.push(Ext.clone(itemConfig));
                        // tack on the text "configured" to the text description only in the secondary flyout menus
                        itemConfig.text += " (Configured)";
                    }

                    // Dynamically add the rate provider entries
                    if (!rateProviders.hasOwnProperty(itemConfig.rateProvider)) {
                        rateProviders[itemConfig.rateProvider] = [];
                    }

                    // populate secondary flyouts
                    var provider = rateProviders[itemConfig.rateProvider];
                    provider.push(itemConfig);
                }
            });
        }
    },

    getShippingRatesMenu: function () {
        var me = this,
            menuData = [];        
        
        if (me.showRuntimePricing) {
            // configured shipping methods that have runtime pricing;
            menuData = Ext.clone(me.runtimeRates);
        } else {
            // the full set of configured shipping methods;
            menuData = Ext.Array.union(                
                me.configuredRatesMenuData,
                me.customConfiguredRatesMenuData 
            )
        }

        if (me.showMethodsByCarrier) {

            // add in the full set of shipping methods by carrier;
            menuData = Ext.Array.union(
                menuData,            
                {
                    xtype: "menuseparator",
                    disabled: true
                }, {
                    xtype: 'menuitem',
                    menu: {
                        plain: true,
                        showSeparator: false,
                        listeners: {
                            click: {
                                fn: me.onShippingMethodChange,
                                scope: me,
                                delegate: "x-menu-item-link"
                            }
                        },
                        items: me.rateProviders["fedex"]
                    },
                    // dont' allow the menu to flyout if there is no content in the list; This happens when the rate provider is unconfigured
                    disabled: !me.rateProviders["fedex"].length,
                    text: (me.rateProviders["fedex"].length) ? "FedEx" : "FedEx (Not Configured)"
                },


                [
                    {
                        xtype: 'menuitem',
                        menu: {
                            plain: true,
                            showSeparator: false,
                            listeners: {
                                click: {
                                    fn: me.onShippingMethodChange,
                                    scope: me,
                                    delegate: "x-menu-item-link"
                                }
                            },
                            items: me.rateProviders["ups"]
                        },
                        disabled: !me.rateProviders["ups"].length,
                        text: (me.rateProviders["ups"].length) ? "UPS" : "UPS (Not Configured)"
                    }
                ], [
                    {
                        xtype: 'menuitem',
                        menu: {
                            plain: true,
                            showSeparator: false,
                            listeners: {
                                click: {
                                    fn: me.onShippingMethodChange,
                                    scope: me,
                                    delegate: "x-menu-item-link"
                                }
                            },
                            items: me.rateProviders["usps"]
                        },
                        disabled: !me.rateProviders["usps"].length,
                        text: (me.rateProviders["usps"].length) ? "USPS" : "USPS (Not Configured)"
                    }
                ]
            );
        }

        return menuData;
    },
    onDestroy: function () {
        this.callParent(arguments);
    }
});