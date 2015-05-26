//test

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
 * @requires Taco.controller.Inventory
 * @requires Taco.controller.Message
 * @requires Taco.controller.Catalog

 * @requires Taco.controller.Testing
 * @requires Taco.controller.FileManager
 * @requires Taco.controller.Discounts
 * @requires Taco.controller.Settings
 
 * @requires Taco.controller.Themes
 * @requires Taco.controller.Themesettings
 * @requires Taco.controller.Account
 * @requires Taco.controller.GeneralSettings
 * @requires Taco.controller.Localization
 
 * @requires Taco.controller.BusinessIntelligence
 
 * @requires Taco.controller.Orders
 * @requires Taco.controller.PhoneOrders
 
 * @requires Taco.controller.Errors
 * The Taco namespace contains all extensions written for Taco (Mozu, if you're nasty.)
 */
Ext.ns('Taco');
Taco.baseCSSPrefix = 'taco-';

Ext.Ajax.defaultHeaders = {
    Accept: '*/*'
};

window.console = window.console || {
    log: function () {}
};

//Ext.Loader.setPath('Taco', '/admin/Scripts/app');

Ext.define('Taco.Application', {
    extend: 'Ext.app.Application',
    name: 'Taco',
    appFolder: '/admin/Scripts/app',
    autoCreateViewport: false,
    requires: [
        'Taco.core.util.Common',
        'Taco.overrides.panel.Header',
        'Taco.overrides.dom.ElementAddons',
        'Taco.overrides.selection.CellModel',
        'Taco.overrides.view.AbstractView',
        'Taco.overrides.LoadMask',
        'Taco.overrides.ZIndexManager',
        'Taco.overrides.picker.Month',
        'Taco.overrides.data.AbstractStore',
        'Taco.overrides.form.Basic',
        'Taco.overrides.form.FieldContainer',
        'Taco.overrides.form.field.Base',
        'Taco.overrides.form.field.ComboBox',
        'Taco.overrides.form.field.Number',
        'Taco.overrides.form.field.HtmlEditor',
        'Taco.overrides.form.field.Radio',
        'Taco.overrides.grid.Panel',
        'Taco.overrides.grid.RowEditor',
        'Taco.overrides.grid.RowEditorButtons',
        'Taco.overrides.grid.plugin.RowEditing',
        'Taco.overrides.grid.plugin.CellEditing',
        //'Taco.overrides.menu.Item',
        'Taco.overrides.menu.Menu',
        'Taco.overrides.panel.Tool',
        'Taco.overrides.toolbar.Paging',
        'Taco.overrides.window.MessageBox',
        'Ext.data.association.HasOne',
        'Taco.core.data.RemoteException',
        'Taco.core.context.TaContext',
        'Taco.locale.Strings',
        'Taco.store.LocalizedStrings',
        'Taco.core.data.StoreManager',
        'Taco.core.data.ReadAheadProxy',
        'Taco.core.data.AjaxProxy',
        'Taco.core.data.CategoryTreeProxy',
        'Taco.view.Viewport',
        'Taco.core.util.UploadManager',
        'Taco.core.StateManager',
        'Ext.util.Cookies',
        'Taco.core.ux.IconList',
        'Taco.core.ux.CardPanel',
        'Taco.core.ux.CellEditing',
        'Taco.core.ux.DragDropZone',
        'Taco.core.ux.form.field.EditableDisplayField',
        'Taco.core.ux.window.MessageBox',
        'Taco.view.Header',
        'Ext.state.CookieProvider',
        'Ext.draw.Component',
        'Ext.layout.container.Form',
        'Ext.layout.container.Column',
        'Ext.layout.container.Accordion',
        'Ext.layout.container.Absolute',
        'Ext.form.field.Radio',
        'Taco.core.ux.form.field.SingleImageField',
        'Ext.ux.form.MultiSelect',
        'Taco.store.TooltipHelp',
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Filter'
    ],
    controllers: [
        //'Analytics',
        //'Capability',
        'Dashboard',
        //'Reports',
        'Navigation',
        'Customers',
        //'StoreCredits',
        //'CustomerAttributes',
        //'Categories',
        //'Products',
        //'PendingChanges',
        //'Inventory',
        'Message'
        //'Catalog',
        //'Testing',
        //'Discounts',
        //'Settings',
        //'Provisioning',
        //'Tbd',
        //'Themes',
        //'Themesettings',


        //'GeneralSettings',
        //'Tests',
        //'Orders',
        //'OrderAttributes',
        //'Errors',
        //'Roles',
        //'ProductTypes',
        //'Attributes',
        //'FileManager',
        //'Channels',
        //'Locations',
        //'LocationTypes',
        //'Website',
        //'LocationInventory',
        //'SiteSelection',
        //'Redirects'
    ],
    stores: ['Taco.store.LocalizedStrings'],
    context: null,
    constructor: function (config) {


        

        Ext.override(Ext.Component, {
            beforeRender: function () {
                var me = this,
                    visable;
                if (me.requiredBehaviors) {
                    if (!Ext.isArray(me.requiredBehaviors)) {
                        me.requiredBehaviors = [me.requiredBehaviors];
                    }
                    Ext.each(me.requiredBehaviors, function (reqBeh) {
                        var model;
                        if (Ext.isNumber(reqBeh)) {
                            if (!Ext.Array.contains(Taco.user.behaviors, reqBeh)) {
                                me.hidden = true;
                            }
                        }
                        if (Ext.isObject(reqBeh)) {
                            model = Ext.ModelManager.getModel(reqBeh.model);
                            if (!model.allowMethod(reqBeh.behavior)) {
                                if (reqBeh.disable) {
                                    me.disabled = true;
                                } else {
                                    me.hidden = true;
                                }
                            }
                        }
                    });
                }
                me.callParent(arguments);
            }
        });


        Ext.override(Ext.AbstractComponent, {
            removeCls: function (cls) {
                var me = this,
                    el = me.rendered ? me.el : me.protoEl;
                //adding null check
                if (el) {
                    el.removeCls.apply(el, arguments);
                }
                return me;
            },
            printHiearchy: function (index, tab) {
                if (!tab) tab = '\t';
                if (!index) index = 0;
                if (this.items) {
                    this.items.each(function (item, index) {
                        item.printHiearchy(index, tab + '\t');
                        //dump(item, index, tab + '\t')
                    });
                }
            }
        });

        Ext.override(Ext.data.proxy.Ajax, {
            constructor: function (config) {
                var me = this;
                me.timeout = 90000;
                this.callParent([config]);
                me.on('exception', function () {
                    console.error('ajaxproxy-exception', arguments);
                }, me);

            },
            setException: function (operation, response) {
                operation.setException({
                    status: response.status,
                    responseText: response.responseText,
                    statusText: response.statusText,
                    remoteException: Ext.create('Taco.core.data.RemoteException', {
                        response: response
                    })
                });
            },
            afterRequest: function (request, success) {
                var me = this;
                this.callParent(arguments);
                if (success && request && request.action !== 'read' && this.model && this.model.$className) {
                    Taco.core.data.StoreManager.fireEvent('afterproxyrequest', request, success, this.model);
                }

            },
            encodeFilters: function (filters) {
                var min = [],
                    length = filters.length,
                    i = 0;

                for (; i < length; i++) {
                    min[i] = {
                        property: filters[i].property,
                        value: filters[i].value
                    };
                    if (filters[i].comparison) {
                        min[i].comparison = filters[i].comparison;
                    }
                }
                return this.applyEncoding(min);
            }
        });

        Ext.override(Ext.data.Connection, {
            onStateChange: function (request) {
                if (request && request.xhr && request.xhr.readyState === 4) {
                    this.clearTimeout(request);
                    this.onComplete(request);
                    this.cleanup(request);
                    Ext.EventManager.idleEvent.fire();
                }
            }
        });

        Ext.override(Ext.toolbar.Paging, {
            doRefresh: function () {
                var me = this,
                    current = me.store.currentPage;

                if (me.fireEvent('beforechange', me, current) !== false) {
                    me.store.loadPage(current, {
                        refresh: true
                    });
                }
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

        Ext.override(Ext.ux.form.MultiSelect, {
            afterRender: function () {
                var me = this,
                    records;

                me.callSuper();
                if (me.selectOnRender) {
                    records = me.getRecordsForValue(me.value);
                    if (records.length) {
                        ++me.ignoreSelectChange;
                        me.boundList.getSelectionModel().select(records,false, true);
                        --me.ignoreSelectChange;
                    }
                    delete me.toSelect;
                }

                if (me.ddReorder && !me.dragGroup && !me.dropGroup) {
                    me.dragGroup = me.dropGroup = 'MultiselectDD-' + Ext.id();
                }

                if (me.draggable || me.dragGroup) {
                    me.dragZone = Ext.create('Ext.view.DragZone', {
                        view: me.boundList,
                        ddGroup: me.dragGroup,
                        dragText: '{0} Item{1}',
                        validHandleClass: 'x-boundlist-item-drag',
                        onInitDrag: function (x, y) {
                            var me = this,
                                data = me.dragData,
                                view = data.view,
                                selectionModel = view.getSelectionModel(),
                                record = view.getRecord(data.item),
                                e = data.event;

                            if (!selectionModel.isSelected(record)) {
                                selectionModel.select(record, (selectionModel.getSelectionMode === 'SIMPLE'));
                            }
                            data.records = selectionModel.getSelection();

                            me.ddel.update(me.getDragText());
                            me.proxy.update(me.ddel.dom);
                            me.onStartDrag(x, y);
                            return true;
                        },
                        isValidHandleChild: function (node) {
                            var valid = true,
                                nodeName,
                                i, len;

                            try {
                                nodeName = node.nodeName.toUpperCase();
                            } catch (e) {
                                nodeName = node.nodeName;
                            }
                            valid = valid && !this.invalidHandleTypes[nodeName];
                            valid = valid && !this.invalidHandleIds[node.id];

                            for (i = 0, len = this.invalidHandleClasses.length; valid && i < len; ++i) {
                                valid = !Ext.fly(node).hasCls(this.invalidHandleClasses[i]);
                            }
                            if (!Ext.isEmpty(this.validHandleClass)) {
                                valid = Ext.fly(node).hasCls(this.validHandleClass);
                            }

                            return valid;
                        }
                    });
                }
                if (me.droppable || me.dropGroup) {
                    me.dropZone = Ext.create('Ext.view.DropZone', {
                        view: me.boundList,
                        ddGroup: me.dropGroup,
                        handleNodeDrop: function (data, dropRecord, position) {
                            var view = this.view,
                                store = view.getStore(),
                                records = data.records,
                                index;

                            // remove the Models from the source Store
                            data.view.store.remove(records);

                            index = store.indexOf(dropRecord);
                            if (position === 'after') {
                                index++;
                            }
                            store.insert(index, records);
                            view.getSelectionModel().select(records);
                            me.fireEvent('drop', me, records);
                        }
                    });
                }
            }
        });


        Ext.override(Ext.tree.View, {
            destroy: function () {
                var treeStore = this.panel.getStore();
                if (treeStore) {
                    treeStore.removeOwnedListener(this);
                }
                if (this.store) {
                    this.store.removeOwnedListener(this);
                }

                return this.callParent(arguments);
            }
        });

        // fix hide submenu (in chrome 43) 
        // bug fix from https://www.sencha.com/forum/showthread.php?301116
        // subnav menus were disappearing in newest version of chrome, this fixes it
        // this override can be removed once we update to v5 of EXT

        Ext.override(Ext.menu.Menu, {
            onMouseLeave: function(e) {
            var me = this;

            // BEGIN FIX
            var visibleSubmenu = false;
            me.items.each(function(item) { 
                if(item.menu && item.menu.isVisible()) { 
                    visibleSubmenu = true;
                }
            });
            if(visibleSubmenu) {
                //console.log('apply fix hide submenu');
                return;
            }
            // END FIX

            me.deactivateActiveItem();

            if (me.disabled) {
                return;
            }


            me.fireEvent('mouseleave', me, e);
            }
        });


        Ext.util.Observable.prototype.removeOwnedListener =
            function (owner) {
                var me = this;
                Ext.Object.each(me.events, function (eventName, eventObj) {
                    var listners = Ext.Array.clone(eventObj.listeners);
                    Ext.each(listners, function (listnerCfg) {

                        if (listnerCfg.scope === owner) {
                            me.un(eventName, listnerCfg.fn, owner);
                        }
                    });
                });
        };
        this.callParent([config]);
    },

    init: function () {
        var stringStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.LocalizedStrings');
        stringStore.loadRawData(Taco.localizationValues);
        this.callParent(arguments);
    },
    setLoading: function (config) {
        if (config === false) {
            this.viewPort.setLoading(false);
            this.shouldShowLoadmask = false;
            return;
        }
        this.shouldShowLoadmask = true;
        Ext.defer(function () {
            if (this.shouldShowLoadmask) {
                this.viewPort.setLoading(config);
            }
        }, 200, this);

    },


    launch: function () {

        window.Taco.app = this;

        Ext.state.Manager.setProvider(new Ext.state.LocalStorageProvider({
            prefix: 'mozu-'
        }));
        var me = this,
            qs = Ext.Object.fromQueryString(window.location.search),
            probeFn,
            callbackFn,
            cnt;

        if (qs.onBeforeLaunch) {
            callbackFn = function () {
                me.doTheNeedful();
            };
            cnt = 0;
            probeFn = function () {
                if (window[qs.onBeforeLaunch]) {
                    window[qs.onBeforeLaunch](callbackFn);
                } else {
                    cnt++;
                    if (cnt > 2000) {
                        me.doTheNeedful();
                    } else {
                        setTimeout(probeFn, 100);
                    }

                }
            }
            probeFn();
        } else {
            Ext.onReady(this.doTheNeedful, this);
        }
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

    initDocumentDragAndDrop: function () {
        this.DragDropZone = Taco.core.ux.DragDropZone;

        this.DragDropZone.initDocumentListeners(this);
    },

    initPrimaryMenu: function () {
        var nc = this.getNavigationController();
        if (!nc._initialized) {
            nc.init();
        }
    },

    initContext: function () {
        this.context = Ext.create('Taco.core.context.TaContext', Taco.user.taContext);
    },

    doTheNeedful: function (state) {


        if (Taco.showViewPort === false) {
            //return;
        }
        var me = this;
        this.initContext();
        this.initViewPort();
        this.initStateManager();
        this.initDocumentDragAndDrop();
        this.initPrimaryMenu();

        // add some utility stuff
        Ext.apply(Ext.form.field.VTypes, {
            currency: function (v) {
                return v === Ext.util.Format.currency(v, '', 2);
            },
            num: function (v) {
                return v !== "" && !isNaN(v);
            },
            numMask: /[\d\.]/,
            nullableint: function (v) {
                return v === "" || !isNaN(parseInt(v, 10));
            },
            nullableintMask: /\d/
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

        Ext.apply(Ext.util.Format, {
            siteCurrency: function (value, siteId) {
                return Taco.app.context.findSite(siteId).formatCurrency(value);
            }
        });
    }
});