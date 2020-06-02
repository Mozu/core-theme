/**
 * @class Taco.view.order.Edit
 */


Ext.define('Taco.view.order.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.order.Form',
        'Taco.core.ux.form.Tasks',
        'Taco.core.ux.PrevNextArrowButtons'
    ],
    statics: {
        factory: function (cfg, callback, scope) {
            cfg = Ext.apply(cfg,
            {
                shippingMethodsStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingMethods'),
                channelsStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.Channels'),
                configuredCreditCardsStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ConfiguredCreditCards'),
                countriesStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.Countries')
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
                    storeToLoad: cfg.countriesStore
                }, {
                    storeToLoad: cfg.ConfiguredCreditCards
                }
            ]);

            tasks.execute();
        }
    },
    formCls: 'Taco.view.order.Form',

    saveText: Localizer.langResources.ORDERS.Orders.OrderDetails.Label.submit_order,
    saveInProgressText: "Submiting Order...",

    parentTitleCfg: {
        title: Localizer.langResources.ORDERS.Orders.OrderDetails.Label.orders,
        controller: 'orders'
    },
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },

    initComponent: function () {
        this.saveHidden
            = this.cancelHidden
            = !Ext.Array.contains(this.record.get('availableActions'), "SubmitOrder");
        this.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.OrderGrid');

        this.additionalActions = [{
            xtype: 'button',
            ui: 'action',
            scale: "medium",
            cls: 'taco-btn-nextprev taco-btn-nextprev-next',
            itemId: 'next',
            disabled: !this.canNavigateToNext(),
            margin: '0 0 0 0',
            handler: this.navigateToNext,
            scope: this
        }, {
                xtype: 'button',
                ui: 'action',
                scale: "medium",
                cls: 'taco-btn-nextprev taco-btn-nextprev-prev',
                itemId: 'previous',
                disabled: !this.canNavigateToPrevious(),

                margin: '0 0 0 10',

                handler: this.navigateToPrevious,
                //dirtyState: this.record.get('publishedState') !== 'Live'
                scope: this
            }
        ];

        this.additionalActions = [{
            xtype: 'taco.prevnext',
            canNavigateToNext: this.canNavigateToNext(),
            canNavigateToPrevious: this.canNavigateToPrevious(),
            itemId: 'prevnextorder',
            listeners: {
                navigateToNext: this.navigateToNext,
                navigateToPrevious: this.navigateToPrevious,
                scope: this
            },
            record: this.record,
            store: this.store
        }];

        this.callParent(arguments);

        this.mon(this.record, 'reload', this.handleReload, this);

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
            Taco.core.StateManager.attemptNavigate('s-' + this.record.data.siteId + '/orders/edit/' + this.record.data.id);
        });

        this.on({
            boxready: this.handleBoxReady,
            afterlayout: this.handleAfterLayout,
            scope: this
        });

        this.navHeader.hide();
    },

    handleReload: function (r) {
        this.up('order-split').fireEvent('titlechange', this, '#' + this.record.get('orderNumber'));
    },

    handleBoxReady: function () {
        this.bodyEl = this.getEl().down('.x-panel-body');

        this.mon(this.bodyEl, 'scroll', function () {
            this.lastScrollTop = this.bodyEl.getScrollTop();
        }, this);
    },

    handleAfterLayout: function () {
        var scrollTop = 0;

        if (!this.bodyEl) {
            return;
        }

        scrollTop = this.bodyEl.getScrollTop();

        if (scrollTop !== this.lastScrollTop) {
            this.bodyEl.setScrollTop(this.lastScrollTop);
        }
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