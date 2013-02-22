/**
 * @class Taco
 * @singleton
 * @requires Taco.core.data.StoreManager
 * @requires Taco.core.data.ReadAheadProxy
 * @requires Taco.core.data.AjaxProxy
 * @requires Taco.view.Viewport
 * @requires Taco.core.util.UploadManager
 * @requires Taco.core.StateManager
 * @requires Ext.util.Cookies
 * @requires Taco.core.ux.IconList
 * @requires Taco.core.ux.CardPanel
 * @requires Taco.core.ux.CellEditing
 * @requires Taco.core.ux.Flexbox
 * @requires Taco.view.Header
 * @requires Ext.state.CookieProvider
 * @requires Ext.draw.Component
 * @requires Ext.layout.container.Form 
 * @requires Ext.layout.container.Column 
 * @requires Ext.layout.container.Accordion 
 * @requires Ext.layout.container.Absolute
 * @requires Ext.form.field.Radio
 * @requires Taco.controller.Analytics
 * @requires Taco.controller.Dashboard
 * @requires Taco.controller.Navigation
 * @requires Taco.controller.Customers
 * @requires Taco.controller.Categories
 * @requires Taco.controller.Products
 * @requires Taco.controller.PendingChanges
 * @requires Taco.controller.Options
 * @requires Taco.controller.Inventory
 * @requires Taco.controller.Message
 * @requires Taco.controller.Catalog
 * @requires Taco.controller.Sites
 * @requires Taco.controller.Testing
 * @requires Taco.controller.FileManagement
 * @requires Taco.controller.Discounts
 * @requires Taco.controller.PaymentAndCheckout
 * @requires Taco.controller.Tax
 * @requires Taco.controller.Themes
 * @requires Taco.controller.Themesettings
 * @requires Taco.controller.Account
 * @requires Taco.controller.GeneralSettings
 * @requires Taco.controller.Email
 * @requires Taco.controller.Orders
 * @requires Taco.controller.PhoneOrders
 * @requires Taco.controller.Shipping
 * @requires Taco.controller.Errors
 * The Taco namespace contains all extensions written for Taco (Mozu, if you're nasty.)
 */
Ext.ns('Taco');
Taco.baseCSSPrefix = 'taco-';



window.console = window.console || {
    log: function() {
    }
};

Ext.application({
    name: 'Taco',
    autoCreateViewport: false,
    appFolder: '/admin/Scripts/app',
    requires: [
            'Ext.data.association.HasOne',
            'Taco.core.context.TaContext',
            'Taco.locale.Strings',
            'Taco.store.LocalizedStrings',
            'Taco.core.data.StoreManager',
            'Taco.core.data.ReadAheadProxy',
            'Taco.core.data.AjaxProxy',
            'Taco.view.Viewport',
            'Taco.core.util.UploadManager',
            'Taco.core.StateManager',
            'Ext.util.Cookies',
            'Taco.core.layout.Auto',
            'Taco.core.layout.HFlex',
            'Taco.core.layout.VFlex',
            'Taco.core.ux.IconList',
            'Taco.core.ux.CardPanel',
            'Taco.core.ux.CellEditing',
            'Taco.core.ux.Panel',
            'Taco.view.Header',
            'Ext.state.CookieProvider',
            'Ext.draw.Component',
            'Ext.layout.container.Form',
            'Ext.layout.container.Column',
            'Ext.layout.container.Accordion',
            'Ext.layout.container.Absolute',
            'Ext.form.field.Radio'

    ],
    controllers: [
            'Analytics',
            'Dashboard',
            'Navigation',
            'Customers',
            'Categories',
            'Products',
            'PendingChanges',
            'Options',
            'Inventory',
            'Message',
            'Catalog',
            'Sites',
            'Testing',
            'FileManagement',
            'Discounts',
            'PaymentAndCheckout',
            'Tax',
            'Themes',
            'Themesettings',
            'Account',
            'GeneralSettings',
            'Email',
            'Orders',
            'PhoneOrders',
            'Shipping',
            'Errors',
            'Roles',
            'ProductTypes'
           ],
    stores: ['Taco.store.LocalizedStrings'],
    context:null,
    constructor: function (config) {

        this.context = Ext.create('Taco.core.context.TaContext', Taco.User.taContext);

        Ext.override(Ext.data.AbstractStore, {
            constructor: function () {
                this.callParent(arguments);
                
                this.dirtyState = false;

                this.on({
                    load: function (store) {
                        this.dirtyStateCheck();
                    },
                    update: function () {
                        this.dirtyStateCheck();
                    },
                    datachanged: function () {
                        this.dirtyStateCheck();
                    },
                    scope: this
                });
            },

            dirtyStateCheck: function () {
                var currentState = this.isDirty();

                if (currentState === this.dirtyState) {
                    return;
                }
                this.dirtyState = currentState;
                this.fireEvent('dirtychange', this, currentState);
            },

            isDirty: function () {
                return this.getNewRecords().length !== 0 || this.getUpdatedRecords().length !== 0 || this.getRemovedRecords().length !== 0;
            },

            hasLoaded: function () {
                return this.lastOptions != null;
            },

            removeOwnedListener: function (owner) {
                var me = this;
                Ext.Object.each(me.events, function (eventName, eventObj) {
                    var listners = Ext.Array.clone(eventObj.listeners);
                    Ext.each(listners, function (listnerCfg) {
                        
                        if (listnerCfg.scope == owner) {
                            if (eventName == "beforefill") {
                                console.log(eventName);
                            }
                            me.un(eventName, listnerCfg.fn, owner);
                        }
                    });
                });
            }
        });

        Ext.override(Ext.data.StoreManager, {
            lookup: function (cfg) {
                if (cfg && !cfg.isStore && (cfg.type || cfg.model)) {
                    return Taco.core.data.StoreManager.getOrCreate(cfg);
                }
                return this.callParent([cfg]);
            }
        });

        Ext.override(Ext.tree.View, {
            destroy: function () {
                var treeStore = this.panel.getStore();
                if (treeStore) {
                    treeStore.removeOwnedListener( this);
                }
                if (this.store) {
                    this.store.removeOwnedListener(this);
                }
                    
                return this.callParent(arguments);
            }
        
        });

        Ext.util.Observable.prototype.removeOwnedListener =
            function(owner) {
                var me = this;
                Ext.Object.each(me.events, function(eventName, eventObj) {
                    var listners = Ext.Array.clone(eventObj.listeners);
                    Ext.each(listners, function(listnerCfg) {

                        if (listnerCfg.scope == owner) {
                            if (eventName == "beforefill") {
                                console.log(eventName);
                            }
                            me.un(eventName, listnerCfg.fn, owner);
                        }
                    });
                });
            };
        this.callParent([config]);
    },
    doInit: function (app) {
        if (!this._initialized) {

            var stringStore = Ext.data.StoreManager.lookup('Taco.store.LocalizedStrings');

            stringStore.load({
                scope: this,
                callback: function (records, operation, success) {
                    this.init(app);
                    this._initialized = true;
                    // console.log(records);
                }
            });
        }
    },

   
    signalCacheFlush: function (data) {

        Ext.Ajax.request({
            jsonData: data,
            disableCaching: true,
            method: 'POST',
            url: '/misc/cacheflush/index',
            timeout: 5000
        });
    },
    launch: function () {

        Taco.baseCSSPrefix = 'taco-';

        window.Taco.app = this;
        // console.log('launching');
        Ext.onReady(this.doTheNeedful, this, false);

        // console.log('launched');
    },
    initViewPort: function () {
        var me = this;

        this.getView('Viewport').create();
        me.viewPort = Ext.getCmp('primaryViewPort');
        me.relayEvents(me.viewPort, ['setmessage']);
        me.contentView = Ext.getCmp('contentView');
    },

    initStateManager: function () {
        this.StateManager = Taco.core.StateManager;

        this.StateManager.initialize();
    },
    doTheNeedful: function (state) {


        if (Taco.showViewPort === false) {
            //return;
        }
        var me = this;
        this.initViewPort();
        this.initStateManager();

        // add some utility stuff
        Ext.apply(Ext.form.field.VTypes, {
            currency: function (v) {
                return v === Ext.util.Format.usMoney(v).replace('$', '');
            },
            num: function (v) {
                return v !== "" && !isNaN(v);
            }
        });

        // initiate quicktips
        Ext.tip.QuickTipManager.init();

        Taco.app.refreshStyle = function () {
            var tick = new Date().getTime();

            Ext.each(Ext.query('link[rel=stylesheet]'), function () {
                var oldLink = new Ext.dom.Element(this),
                        link = document.createElement('link');

                link.rel = 'stylesheet';
                link.href = this.href.split('?')[0] + '?' + tick;

                Ext.getHead().appendChild(link);

                Ext.defer(function () {
                    oldLink.remove();
                }, 700);
            });
        };


    }
});
