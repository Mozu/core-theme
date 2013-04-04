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

var aprilFools = (function () {
    var times = 0,
        flickers = [{
            '-webkit-transform': 'skewX(1deg)',
            '-webkit-transform-origin': 'center',
            '-webkit-filter': 'none',
            'transition': '0.075s'
        },
        {
            '-webkit-transform': 'skewX(-2.5deg)',
            '-webkit-transform-origin': 'top',
            '-webkit-filter': 'invert(75%) blur(5px)'
        },
        {
            'background-image': 'http://fc01.deviantart.net/fs70/f/2011/172/9/8/tv_static_by_tbh_1138-d3jmbjq.gif',
            '-webkit-transform': 'skewX(2.5deg)',
            '-webkit-transform-origin': 'center'
        },
        {
            '-webkit-transform': 'skewX(-0.5deg)',
            '-webkit-filter': 'hue-rotate(100deg) blur(2px) saturate(7.5)'
        },
        {
            '-webkit-transform': 'skewX(1.5deg) rotate(2deg)',
            '-webkit-filter': 'hue-rotate(30deg) brightness(4.5) contrast(100%)',
            'background-image': 'none'
        },
        {
            '-webkit-transform': 'skewX(-1.5deg) rotate(2deg)',
            '-webkit-filter': 'hue-rotate(70deg) brightness(7.5) contrast(100%)',
            'background-image': 'none'
        },
        {
            '-webkit-transform': 'skewX(1deg)',
            '-webkit-filter': 'hue-rotate(174deg) saturate(3) sepia(5)'
        }],
        body,
        flickerTimeout,
        $knobContainer,
        $appContainer,
        numClicks = 0,
        reBase = "\\([^\\)]+\\)";

    

    function flicker() {
        body.setStyle(flickers[Math.floor(Math.random()*4)]);
        flickerTimeout = setTimeout(flicker, 20 + Math.floor(Math.random()*200));
    }

    function addKnob(name, propName, coefficient, unit, min) {
        var $inp = $('<input/>')
        .attr({
            'data-width': '40',
            'data-min': '0',
            'data-max': '100',
            'data-skin': 'tron',
            'data-fgColor': '#d2463c',
            'data-thickness': '.6',
            'data-angleArc': '120',
            'data-angleOffset': '300',
            'data-displayInput': 'false'
        });
        var $labelCont = $('<div/>')
            .css({
                'float': 'left',
                'text-align': 'center',
                'margin-right': 20
            })
            .append('<label style="color: white; display: block; font-size: 9pt; line-height: 11pt">' + name + '</label>')
                    .append($inp)

        $labelCont.appendTo($knobContainer);

        if (typeof propName === "string") {
            var re = new RegExp(propName + reBase);
        }
        $inp.knob({
            change: Ext.Function.createThrottled(typeof propName === "function" ? propName : function (val) {
                val = min === undefined ? val * coefficient : Math.max(val * coefficient, min);
                $appContainer.css('-webkit-filter', $appContainer.css('-webkit-filter').replace(re, propName + '(' + val + unit + ')'));
            }, 50)
        });
    }

    function showKnobs() {

        var $body = $('body');

        $appContainer = $body.css('-webkit-filter','blur(0px) hue-rotate(0deg) brightness(1) invert(0)');

        $knobContainer = $('<div/>').css({
            'position': 'absolute',
            'left': 180,
            'top': 13
        })
        .appendTo('body');

        var blurRe = new RegExp("blur" + reBase);
        addKnob('FOCUS', 'blur', .08, 'px');
        addKnob('HUE', 'hue-rotate', 3, 'deg');
        addKnob('BRIGHT', 'brightness', .04, '', 1);
        addKnob('POLARITY', 'invert', 1, '%');
        addKnob('SKEW', function (val) {
            $appContainer.css({
                '-webkit-transform': 'skewX(' + (val * 0.1) + 'deg)',
                '-webkit-transform-origin': 'top'
            });
        });
        var lastGoat = 0;
        addKnob('GOAT', function (val) {
            if (val < 10) return $('.goat').remove();
            if (val % 10 == 0) {
                if (val > lastGoat) {
                    placeGoat();
                } else {
                    $('.goat').last().remove();
                }
                lastGoat = val;
            }
        });
                    
    }

    var allGoats = [
        'http://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Hausziege_04.jpg/512px-Hausziege_04.jpg',
        'http://www.kayfabenews.com/wp-content/uploads/2013/01/goat.jpg',
        'http://stringvisions.ovationpress.com/wp-content/uploads/2011/11/goat2a.bmp',
        'http://www.dreamstime.com/young-pygmy-goat-thumb5205749.jpg'
    ]
    function provideGoat() {
        return allGoats[Math.floor(Math.random() * allGoats.length)];
    }
    function placeGoat() {
            var div = document.createElement('div');
            div.className = "goat";
            div.style.position = 'fixed';
	
            var numType = 'px';
            var heightRandom = Math.random()*.75;
            var windowHeight = 768;
            var windowWidth = 1024;
            var height = 0;
            var width = 0;
            var de = document.documentElement;
            if (typeof(window.innerHeight) == 'number') {
                windowHeight = window.innerHeight;
                windowWidth = window.innerWidth;
            } else if(de && de.clientHeight) {
                windowHeight = de.clientHeight;
                windowWidth = de.clientWidth;
            } else {
                numType = '%';
                height = Math.round( height*100 )+'%';
            }
	
            div.style.zIndex = 10;
            div.style.outline = 0;
	
                if( numType=='px' ) div.style.top = Math.round( windowHeight*heightRandom ) + numType;
                else div.style.top = height;
                div.style.left = Math.round( Math.random()*90 ) + '%';
	
            var img = document.createElement('img');
            img.setAttribute('src',provideGoat());
            var ease = "all .1s linear";
            //div.style['-webkit-transition'] = ease;
            //div.style.webkitTransition = ease;
            div.style.WebkitTransition = ease;
            div.style.WebkitTransform = "rotate(1deg) scale(1.01,1.01)";
            //div.style.MozTransition = "all .1s linear";
            div.style.transition = "all .1s linear";
            div.onmouseover = function() {
                var size = 1+Math.round(Math.random()*10)/100;
                var angle = Math.round(Math.random()*20-10);
                var result = "rotate("+angle+"deg) scale("+size+","+size+")";
                this.style.transform = result;
                //this.style['-webkit-transform'] = result;
                //this.style.webkitTransform = result;
                this.style.WebkitTransform = result;
                //this.style.MozTransform = result;
                //alert(this + ' | ' + result);
            }
            div.onmouseout = function() {
                var size = .9+Math.round(Math.random()*10)/100;
                var angle = Math.round(Math.random()*6-3);
                var result = "rotate("+angle+"deg) scale("+size+","+size+")";
                this.style.transform = result;	
                //this.style['-webkit-transform'] = result;
                //this.style.webkitTransform = result;
                this.style.WebkitTransform = result;
                //this.style.MozTransform = result;
            }
            var body = document.getElementsByTagName('body')[0];
            body.appendChild(div);
            div.appendChild(img);	

        }
    

    function listenForClicks() {
        body.on('click', function () {
            if (++numClicks === 2) {
                clearTimeout(flickerTimeout);
                body.setStyle({
                    'background-image': 'none',
                    '-webkit-transform': 'none',
                    '-webkit-filter': 'none',
                    'transition': 'none'
                });
                showKnobs();
            }
        });
    }

    return function (b) {
        if (b) body = b;        Ext.Loader.loadScript({
            url: '//ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js',
            onLoad: function () {
                Ext.Loader.loadScript({
                    url: 'https://raw.github.com/aterrien/jQuery-Knob/master/js/jquery.knob.js',
                    onLoad: function () {
                        listenForClicks();
                        flicker();
                    }
                });
            }
        });
    };
        

}());

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
            'Taco.core.data.CategoryTreeProxy',
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
            'Taco.core.ux.form.field.Base',
            'Taco.core.ux.form.field.Container',
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
            'PageTemplates',
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
            'ProductTypes',
            'Attributes'
           ],
    stores: ['Taco.store.LocalizedStrings'],
    context:null,
    constructor: function (config) {

        this.context = Ext.create('Taco.core.context.TaContext', Taco.User.taContext);

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
                    remoteException: Ext.decode(response.responseText, true)
                });
            },
            afterRequest: function (request, success) {
                var me = this;
                this.callParent(arguments);
                if (success && request && request.action != 'read' && this.model && this.model.$className) {
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
            },
        });

        Ext.override(Ext.data.Connection , {
            onStateChange: function (request) {
                if (request && request.xhr && request.xhr.readyState == 4) {
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

        if (window.location.href.indexOf('fool=true') !== -1) aprilFools(Ext.getBody());

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
