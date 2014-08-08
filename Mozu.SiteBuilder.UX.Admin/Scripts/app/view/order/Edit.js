/**
 * @class Taco.view.order.Edit
 */


Ext.define('Taco.view.order.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.order.Form',
        'Taco.core.ux.form.Tasks'
    ],
    statics: {
        factory: function (cfg, callback, scope) {
            cfg = Ext.apply(cfg,
            {
                shippingMethodsStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingMethods'),
                channelsStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.Channels'),
                configuredCreditCardsStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ConfiguredCreditCards'),
                countriesStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.Countries'),
                attributesStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.Attributes')
            });

            var tasks = Ext.create('Taco.core.ux.form.Tasks', {
                finalCallback: function () {
                    callback.call(scope || this, Ext.create('Taco.view.order.Edit', cfg));
                }
            });
            tasks.add([
                {
                    storeToLoad: cfg.shippingMethodsStore
                }, {
                    storeToLoad: cfg.channelsStore
                }, {
                    storeToLoad: cfg.attributesStore
                }, {
                    storeToLoad: cfg.countriesStore
                }, {
                    storeToLoad: cfg.ConfiguredCreditCards
                }
            ]);

            tasks.execute();
        }
    },
    formCls: 'Taco.view.order.Form',

    saveText: "Submit Order",
    saveInProgressText: "Submiting Order...",


    initComponent: function () {
        this.saveHidden
            = this.cancelHidden
            = this.record.get('orderStatus') !== 'Pending';
        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.OrderGrid');

        

        this.additionalActions = [{
            xtype: 'button',
            ui: 'action',
            scale: "medium",
            itemId: 'next',
            text: 'Next',
            disabled: !this.canNavigateToNext(),

            margin: '0 0 0 10',
            
            handler: this.navigateToNext,
            
            //dirtyState: this.record.get('publishedState') !== 'Live'
            scope: this
        },
        {
                xtype: 'button',
                ui: 'action',
                scale: "medium",
                itemId: 'previous',
                text: 'Previous',
                disabled: !this.canNavigateToPrevious(),

                margin: '0 0 0 10',

                handler: this.navigateToPrevious,
                //dirtyState: this.record.get('publishedState') !== 'Live'
                scope: this

            }
        ];




        this.callParent(arguments);
        this.keyNav = Ext.create('Ext.util.KeyNav', Ext.getDoc(), {
            // target: this.getEl(),
            scope: this,
            pageUp: function (e) {
                if (e.shiftKey) {
                    this.navigateToPrevious();
                }
                
            },
            pageDown: function (e) {
                if (e.shiftKey) {
                    this.navigateToNext();
                }
            }
        });
        
        
        this.form.on('savesuccess', function() {
            //alert('yay');
            
            Taco.core.StateManager.attemptNavigate('s-' + this.record.data.siteId + '/orders/edit/' + this.record.data.id);
        });
    },
    navigateTo:function (forward) {
        var index = this.store.indexOfId(this.record.getId()),
            navToIndex = forward ? index + 1 : index - 1,
            outOfIndexMeth = forward ? 'nextPage' : 'previousPage',
            validCheck = forward ? 'canNavigateToNext' : 'canNavigateToPrevious',
            rec;
        if (!this[validCheck]())
            return;

        if (index != -1) {
            this.setLoading();
            rec = this.store.data.getAt(navToIndex);
            if (rec) {
                Taco.core.StateManager.attemptNavigate('/orders/edit/' + rec.getId());
            } else {
                
                this.store[outOfIndexMeth]({
                    scope: this,
                    callback: function () {
                        this.setLoading(false);
                        navToIndex = forward ? 0: this.store.count() - 1;
                        rec = this.store.data.getAt(navToIndex);
                        if (rec) {
                            Taco.core.StateManager.attemptNavigate('/orders/edit/' + rec.getId());
                        }
                    }
                });
            }

        }
    },
    canNavigateToNext:function() {
        var rec = this.store.getById(this.record.getId());
        return rec && this.store.getTotalCount() > 1 && rec.index < this.store.getTotalCount() ;
    },
    canNavigateToPrevious: function () {
        var rec = this.store.getById(this.record.getId());
        return rec && rec.index != 0;
    },
    navigateToPrevious: function () {
        this.navigateTo(false);
    },
    navigateToNext: function () {
        this.navigateTo(true);
    },
    onDestroy: function () {
        this.keyNav.destroy();
        this.callParent(arguments);
    }
});