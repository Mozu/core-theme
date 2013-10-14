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
 * @requires Taco.controller.Options
 * @requires Taco.controller.Inventory
 * @requires Taco.controller.Message
 * @requires Taco.controller.Catalog
 * @requires Taco.controller.Sites
 * @requires Taco.controller.Testing
 * @requires Taco.controller.FileManager
 * @requires Taco.controller.Discounts
 * @requires Taco.controller.Settings
 
 * @requires Taco.controller.Themes
 * @requires Taco.controller.Themesettings
 * @requires Taco.controller.Account
 * @requires Taco.controller.GeneralSettings
 * @requires Taco.controller.Email
 * @requires Taco.controller.Orders
 * @requires Taco.controller.PhoneOrders
 
 * @requires Taco.controller.Errors
 * The Taco namespace contains all extensions written for Taco (Mozu, if you're nasty.)
 */
Ext.ns('Taco');
Taco.baseCSSPrefix = 'taco-';

Ext.Ajax.defaultHeaders = { Accept: '*/*'};

window.console = window.console || {
    log: function() {
    }
};

//Ext.Loader.setPath('Taco', '/admin/Scripts/app');

Ext.define('Taco.Application',{
    extend: 'Ext.app.Application',
    name: 'Taco',
    appFolder: '/admin/Scripts/app',
    autoCreateViewport: false,
    requires: [
            'Taco.overrides.window.MessageBox',
            'Taco.overrides.window.Window',
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
            'Taco.core.ux.Panel',
            'Taco.core.ux.PanelHeader',
            'Taco.core.ux.form.field.Base',
            'Taco.core.ux.form.field.Container',
            'Taco.core.ux.DragDropZone',
            'Taco.view.Header',
            'Ext.state.CookieProvider',
            'Ext.draw.Component',
            'Ext.layout.container.Form',
            'Ext.layout.container.Column',
            'Ext.layout.container.Accordion',
            'Ext.layout.container.Absolute',
            'Ext.form.field.Radio',
            'Taco.overrides.menu.Item'
    ],
    controllers: [
            'Analytics',
            'Dashboard',
        //'Charts',
            'Navigation',
            'Customers',
            'CustomerAttributes',
            'Categories',
            'Products',
            'PendingChanges',
            'Options',
            'Inventory',
            'Message',
            'Catalog',
            'Sites',
            'Testing',
            'Discounts',
            'Settings',
            'PaymentAndCheckout',
            'PageTemplates',
            'Tbd',
            'Themes',
            'Themesettings',
            'Account',
            'GeneralSettings',
            'Email',
            'Orders',
            'OrderAttributes',
            'Errors',
            'Roles',
            'ProductTypes',
            'Attributes',
            'FileManager',
            "Channels",
            "Locations",
            "LocationTypes"
    ],
    stores: ['Taco.store.LocalizedStrings'],
    context: null,
    constructor: function (config) {

        this.context = Ext.create('Taco.core.context.TaContext', Taco.User.taContext);

        Ext.override(Ext.Component, {
            beforeRender: function () {
                var me = this,
                    visable;
                if (me.requiredBehaviors) {
                    if (!Ext.isArray(me.requiredBehaviors)) {
                        me.requiredBehaviors= [me.requiredBehaviors];
                    }
                    Ext.each(me.requiredBehaviors, function (reqBeh) {
                        var model;
                        if (Ext.isNumber(reqBeh)) {
                            if (!Ext.Array.contains( Taco.User.behaviors, reqBeh)) {
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
                console.log(tab + '\t' + index + '. ', this.alias, this.$className, this.layout, this.cls);
                if (this.items) {
                    this.items.each(function (item, index) {
                        item.printHiearchy(index, tab + '\t');
                        //dump(item, index, tab + '\t')
                    });
                }
            }
        });

        Ext.override(Ext.form.field.HtmlEditor, {
            getValue: function () {
                var me = this,
                    value;
                if (!me.rendered) {
                    return me.value ;
                }
                if (!me.sourceEditMode) {
                    if (document.getElementById(me.iframeEl.id)) {
                        me.syncValue();
                    } else {
                        console.log('damn');
                    }
                }
                value =  me.textareaEl.dom.value ;
                me.value = value;
                return value;
            },
            relayCmd: function (cmd, value) {
                if (!this.rendered) {
                    this.on('afterrender', function (html) {
                        html.relayCmd(cmd, value);
                    }, this, { single: true });
                    return;
                }
                Ext.defer(function () {
                    var me = this;
                    if (!this.rendered) {
                        me.relayCmd(cmd, value);
                        return;
                    }
                    
                    me.focus();
                    me.execCmd(cmd, value);
                    me.updateToolbar();
                }, 10, this);
            }
        });
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
                    beforeload: function(store,operation) {
                        if (store.remoteFilter === false) {
                            operation.filters = [];
                        }
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
                return !!this.lastOptions;
            },

            removeOwnedListener: function (owner) {
                var me = this;
                Ext.Object.each(me.events, function (eventName, eventObj) {
                    var listners = Ext.Array.clone(eventObj.listeners);
                    Ext.each(listners, function (listnerCfg) {
                        
                        if (listnerCfg.scope === owner) {
                            if (eventName === "beforefill") {
                                console.log(eventName);
                            }
                            me.un(eventName, listnerCfg.fn, owner);
                        }
                    });
                });
            },

            pluck: function (field) {
                var result = [];

                this.each(function (record) {
                    result.push(record.get(field));
                });

                return result;
            },

            contains: function (record) {
                var found = false;

                this.each(function (item) {
                    if (record === item) {
                        found = item;
                        return false;
                    }
                });

                return found;
            },

            containsById: function (record) {
                var found = false;

                this.each(function (item) {
                    if (record.getId() === item.getId()) {
                        found = item;
                        return false;
                    }
                });

                return found;
            },

            containsByField: function (record, field) {
                var found = false;

                this.each(function (item) {
                    if (record.get(field) === item.get(field)) {
                        found = item;
                        return false;
                    }
                });

                return found;
            },

            containsByFn: function (fn, record) {
                var found = false;

                this.each(function (item) {
                    if (fn(item, record)) {
                        found = item;
                        return false;
                    }
                });

                return found;
            }
        });

        Ext.override(Ext.data.proxy.Ajax, {
            constructor: function (config) {

                var me = this;
                this.callParent([config]);
                me.on('exception', function () {
                    console.log('ajaxproxy-exception', arguments);
                }, me);

            },
            setException: function (operation, response) {
                
                operation.setException({
                    status: response.status,
                    responseText: response.responseText,
                    statusText: response.statusText,
                    remoteException: Ext.create('Taco.core.data.RemoteException', { response: response })
                });
            },
            afterRequest: function (request, success) {
                var me = this;
                this.callParent(arguments);
                if (success && request && request.action !== 'read' && this.model && this.model.$className) {
                    Taco.app.signalCacheFlush({ model: this.model.$className });
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

        Ext.override(Ext.data.Connection , {
            onStateChange: function (request) {
                if (request && request.xhr && request.xhr.readyState === 4) {
                    this.clearTimeout(request);
                    this.onComplete(request);
                    this.cleanup(request);
                    Ext.EventManager.idleEvent.fire();
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
            afterRender: function() {
                var me = this,
                    records;

                me.callSuper();
                if (me.selectOnRender) {
                    records = me.getRecordsForValue(me.value);
                    if (records.length) {
                        ++me.ignoreSelectChange;
                        me.boundList.getSelectionModel().select(records);
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
                        onInitDrag: function(x, y) {
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
                        isValidHandleChild: function(node) {
                            var valid = true,
                                nodeName,
                                i, len;

                            try {
                                nodeName = node.nodeName.toUpperCase();
                            } catch(e) {
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
                        handleNodeDrop: function(data, dropRecord, position) {
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
            destroy: function() {
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
        
        
       
        

        


        Ext.util.Observable.prototype.removeOwnedListener =
            function(owner) {
                var me = this;
                Ext.Object.each(me.events, function(eventName, eventObj) {
                    var listners = Ext.Array.clone(eventObj.listeners);
                    Ext.each(listners, function(listnerCfg) {

                        if (listnerCfg.scope === owner) {
                            if (eventName === "beforefill") {
                                console.log(eventName);
                            }
                            me.un(eventName, listnerCfg.fn, owner);
                        }
                    });
                });
            };
        this.callParent([config]);
    },

    init:function () {
        var stringStore =Taco.core.data.StoreManager.getOrCreate('Taco.store.LocalizedStrings');
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
        }, 500, this);

    },
   
    signalCacheFlush: function (data) {
        return;
        //depricating gheto flush of cache
        //Ext.Ajax.request({
        //    jsonData: data,
        //    disableCaching: true,
        //    method: 'POST',
        //    url: '/misc/cacheflush/index',
        //    timeout: 5000
        //});
    },
    launch: function () {

        //Taco.baseCSSPrefix = 'taco-';

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

    initDocumentDragAndDrop: function () {
        this.DragDropZone = Taco.core.ux.DragDropZone;

        this.DragDropZone.initDocumentListeners(this);
    },

    initPrimaryMenu: function() {
        var nc = this.getNavigationController();
        if (!nc._initialized) {
            nc.init();
        }
    },

    doTheNeedful: function (state) {


        if (Taco.showViewPort === false) {
            //return;
        }
        var me = this;
        this.initViewPort();
        this.initStateManager();
        this.initDocumentDragAndDrop();
        this.initPrimaryMenu();

        // add some utility stuff
        Ext.apply(Ext.form.field.VTypes, {
            currency: function (v) {
                return v === Ext.util.Format.usMoney(v).replace('$', '');
            },
            num: function (v) {
                return v !== "" && !isNaN(v);
            },
            numMask: /[\d\.]/,
            nullableint: function (v) {
                return v === "" || !isNaN(parseInt(v,10));
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


    }
});
