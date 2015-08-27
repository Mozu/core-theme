/**
 * @class Taco.core.ux.content.Container
 * It contains....everything
 */
Ext.define('Taco.core.ux.content.Container', {
    extend: 'Ext.container.Container',
    alias: 'widget.contentcontainer',
    requires: ['Taco.core.ux.content.Header', 'Taco.core.ux.content.Body', 'Taco.core.ux.content.Sidebar'],

    bubbleEvents: ['add', 'remove', 'save', 'cancel'],
    componentCls: 'taco-content-container',
    layout: { type: 'border' },
    region: 'center',

    headerCls: 'Taco.core.ux.content.Header',
    bodyCls: 'Taco.core.ux.content.Body',
    header: {},
    body: {},
    scopeActionHandlers: true,

    // turn on default key listening
    enableKeyMap: false,

    initComponent: function () {
        var me = this;

        if (me.scopeActionHandlers) me.setActionHandlerScope(me.scopeActionHandlers);

        me.arrangePanels();
        
        // Experimental code. 
        if (me.enableKeyMap) {
            me.mon(me, 'render', function () {
                me.initKeyMap();
            }, me)
        }

        me.callParent(arguments);

        me.subscribeEvents();

        Taco.app.fireEvent("createpageview");

    },

    initKeyMap : function (){
        var me = this;
        // adding key listeners for dialogs
        me.keyMap = new Ext.util.KeyMap({
            target: me.el,
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

    setActionHandlerScope: function (scope) {
        var me = this;

        if (me.header && me.header.actions) {
            Ext.Array.forEach(me.header.actions, function (action) {
                if (action) {
                    action.scope = action.scope || me;

                    // TODO: remove this block when all buttons are ext buttons with handlers
                    // for now, this keeps our deprecated buttons functioning
                    if (action.listeners) {
                        action.listeners.scope = action.listeners.scope || me;
                    }
                }
            }, me);
        }
    },

    arrangePanels: function () {
        var me = this;

        me.header = (me.header || {});
        me.header = Ext.create(me.headerCls, Ext.apply(me.header, { region: 'north', contextConfig: this.contextConfig  }));

        me.body = Ext.create(me.bodyCls, Ext.apply(me.body || {}, { region: 'center' }));

        me.main = Ext.create('Ext.Container', {
            region: 'center',
            cls: Taco.baseCSSPrefix + 'content-main',
            layout: { type: 'border' },
            items: [me.header, me.body]
        });

        me.items = [me.main];
    },

    subscribeEvents: function () {
        var me = this;
        me.mon(Taco.core.StateManager, {
            beforenavigate: me.onBeforeNavigate,
            navigate: me.onNavigate,
            statechange: me.onStateChange,
            scope: me
        });
        me.on({
            hide: me.onDisappear,
            destroy: me.onDisappear,
            show: me.onAppear,
            added: me.onAddToContentView,
            afterRender: me.onAfterRender
        });
    },

    onBodyScroll: function (e, t) {
        var me = this,
            isScrolled = this.isScrolled;
        if (!isScrolled && t.scrollTop > 0) {
            isScrolled = true;
            me.getEl().addCls('taco-content-scrolled');
        } else if (isScrolled && t.scrollTop === 0) {
            isScrolled = false;
            me.getEl().removeCls('taco-content-scrolled');
        }
        me.isScrolled = isScrolled;
    },

    onAfterRender: function () {
        this.body.getEl().on({
            scroll: this.onBodyScroll,
            scope: this
        });
    },

    getHeader: function () {
        return this.header;
    },

    getContent: function () {
        return this.body;
    },

    onAppear: function () {
        if (this.ownerCt.destroyEverythingBut) this.ownerCt.destroyEverythingBut(this);
    },

    onAddToContentView: function () {
        var me = this, id;
        me.onAppear();
        if (me.editRecordId && me.launchEditor) {
            id = me.editRecordId;
            me.on('boxready', function () { me.launchEditor(id) });
            delete me.editRecordId;
        }
    },

    onDisappear: function () {
        if (this.logicalParent) {
            this.logicalParent.show()
        }
    },

    onBeforeNavigate: Ext.emptyFn,
    onNavigate: Ext.emptyFn,
    onStateChange: Ext.emptyFn,

    setTitle: function (title) {
        this.getHeader().setTitle(title)
    }
});