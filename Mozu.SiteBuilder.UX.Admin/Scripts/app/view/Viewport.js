/**
 * @class Taco.view.Viewport
 */
Ext.define('Taco.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'Taco.core.ContentView',
        'Taco.view.Header'
    ],

    id: 'primaryViewPort',
    layout: { type: 'border' },

    config: {
        items:[]  
    },

    enableKeyMap: false,

    initComponent: function () {
        var me = this;
        me.contentView = Ext.create('Taco.core.ContentView', { id: 'contentView', region: 'center' });
        me.header = Ext.create('Taco.view.Header', { region: 'north' });
        
        me.items = [
            me.header,
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
            ignoreInputFields:true,
            binding: [{
                // question mark key
                key: 191,
                ctrl: false,
                shift: true,
                fn: me.showContextHelp,
                // prevents the event from bubbling past the modal;
                //defaultEventAction: 'stopEvent',
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
                    console.log("save key press")
                },
                // prevents the event from bubbling past the modal;
                //defaultEventAction: 'stopEvent',
                scope: me
            }]
        });

    },

    showContextHelp: function () {
        var me = this;

        console.log("show context sensitive help menu")
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
