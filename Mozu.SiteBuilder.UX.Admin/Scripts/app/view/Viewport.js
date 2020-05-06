/**
 * @class Taco.view.Viewport
 */
Ext.define('Taco.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'Taco.core.ContentView',
        //'Taco.view.Header'
    ],

    id: 'primaryViewPort',
    layout: { type: 'border' },

    config: {
        items:[]  
    },

    enableKeyMap: true,

    waitingForNavKey: false,

    navBindings : null,

    initComponent: function () {
        var me = this;
        me.contentView = Ext.create('Taco.core.ContentView', { id: 'contentView', region: 'center' });
       // me.header = Ext.create('Taco.view.Header', { region: 'north' });
        
        me.items = [
            //me.header,
            me.contentView
        ];
        
        if (me.enableKeyMap) {
            me.mon(me, 'boxready', function () {
                me.initKeyMap();
            }, me)
        }

        me.callParent(arguments);
    },

    initKeyMap: function () {
        var me = this;
        // this is a set of key map bindings that work regardless. 
        me.formLessKeyMap = new Ext.util.KeyMap({
            target: me.el,
            ignoreInputFields: true,
            processEvent: function (evt) {
                //console.log("processing keypress");
                //console.log("keycode=" + evt.getKey());
                if (me.waitingForNavKey) {
                    
                    var path = me.getNavModeBinding(evt)                    
                    if (path) {
                        Taco.core.StateManager.attemptNavigate(path);
                        me.clearNavMode()
                        //this.waitingForNavKey = false;

                        return evt;
                    } else {
                        // if a nav key we need to intercept and add in isNavKey to the event;
                        //evt.isNavKey = true;
                        return evt
                    }
                } else {
                    return evt;
                }
            },
            binding: [

                /*
                {
                // question mark key
                key: 191,
                ctrl: false,
                shift: true,
                fn: me.showContextHelp,
                // prevents the event from bubbling past the modal;
                //defaultEventAction: 'stopEvent',
                scope: me
                },
                */


            {
                // forward slash to trigger app search
                key: 191,
                ctrl: false,
                shift: false,                
                fn: function (key,e) {
                    var searchFields = Ext.ComponentQuery.query('taco-quickfilter');
                    if (searchFields.length) {
                        searchFields[0].focus();
                        e.stopEvent();
                    }
                },
                // prevents the event from bubbling past the modal;
                defaultEventAction: 'stopEvent',
                scope: me
            }, {
                // forward slash to trigger app search
                key: 191,
                ctrl: true,
                shift: false,
                fn: function (key, e) {

                },
                // prevents the event from bubbling past the modal;
                //defaultEventAction: 'stopEvent',
                scope: me
            }, {
                // listening for the the G key. this will set a temporary mode where additional navigation keys will be processed;
                key: Ext.EventObject.G,
                ctrl: false,
                shift: false,
                fn: me.setNavMode,
                scope: me
            }]
        });

        // this one works even if fields have focus. be careful not to interfere with data entry. These should have modifier keys, ctrl, alt, etc.
        me.keyMap = new Ext.util.KeyMap({
            target: me.el,
            ignoreInputFields: false,
        
            binding: [{
                // Ctrl + Shift + S
                key: Ext.EventObject.S,
                ctrl: true,
                shift: true,
                fn: function () {
                    //console.log("save key press")
                    var saveButton = this.down("#saveActionButton");
                    if (saveButton && saveButton.el) {
                        saveButton.el.dom.click();
                    }
                },
                // prevents the event from bubbling past the modal;
                //defaultEventAction: 'stopEvent',
                scope: me
            }, {
                // Ctrl + Shift + N
                key: Ext.EventObject.A,
                ctrl: true,
                shift: true,
                fn: function () {
                    //console.log("create key press")
                    var createButton = this.down("#createActionButton");
                    if (createButton && createButton.el) {
                        createButton.el.dom.click();
                    }
                },
                // prevents the event from bubbling past the modal;
                //defaultEventAction: 'stopEvent',
                scope: me
            }


            ]
        });
    },

    getNavModeBinding : function(evt){
        
        var key = evt.getKey();
        var store = Ext.getStore("Navigation2");
        var navRecord = store.findRecord("keyNavShortcut", key);

        var binding  = null;
        if (navRecord) {
            binding = navRecord.get('address');
        }

        return binding;
    },

    // enables a temporary mode in which additional keypresses will be processed as navigation shortcuts;    
    setNavMode: function () {    
        var me = this;
        me.waitingForNavKey = true;
        if (!me.navModeTask) {
            me.navModeTask = new Ext.util.DelayedTask(me.clearNavMode,this);
        }
        me.navModeTask.delay(2000)
    },

    // disables the temporary mode in which additional keypresses will be processed as navigation shortcuts;
    clearNavMode: function (){        
        var me = this;        
        this.waitingForNavKey = false;        
        me.navModeTask.cancel();
    },

    showContextHelp: function () {
        var me = this;

        var win = Ext.create('Taco.core.ux.window.Modal', {
            autoShow: true,
            title:"Help",
            listeners: {
                'boxready': {
                    fn: function () {
                        this.mon(Ext.getBody(), 'click', function (el, e) {
                            
                            this.close(this.closeAction);
                        }, this, { delegate: '.x-mask' });
                    },
                    scope:win
                }
            }

        })
    },

    getContentView: function () {
        return this.contentView;
    },

    getHeader: function () {
        return this.header;
    }
});
