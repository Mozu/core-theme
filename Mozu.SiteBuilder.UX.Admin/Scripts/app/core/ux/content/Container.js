/**
 * @class Taco.core.ux.content.Container
 * It contains....everything
 */
Ext.define('Taco.core.ux.content.Container', {
    extend: 'Ext.container.Container',
    alias: 'widget.contentcontainer',
    requires: ['Taco.core.ux.content.Header', 'Taco.core.ux.content.Body', 'Taco.core.ux.content.Sidebar'],
    headerCls: 'Taco.core.ux.content.Header', 
    bodyCls: 'Taco.core.ux.content.Body', 

    bubbleEvents: ['add', 'remove', 'save', 'cancel'],

    cls: 'taco-content-container',

    flex: 1,
    body: {},
    header: {},

    scopeActionHandlers: true,

    initComponent: function () {
        var me = this;

        if (me.scopeActionHandlers) me.setActionHandlerScope(me.scopeActionHandlers);

        me.arrangePanels();

        me.callParent(arguments);

        me.subscribeEvents();

        Taco.app.eventbus.fireEvent("createpageview");
    },

    setActionHandlerScope: function (scope) {
        var me = this;
        if (scope === true) scope = me;
        if (me.header && me.header.actions) {
            for (var i = 0; i < me.header.actions.length; i++) {
                if (me.header.actions[i].listeners) me.header.actions[i].listeners.scope = scope;
            }
        }
    },
            

    arrangePanels: function() {
        var me = this;

        me.header = Ext.create(me.headerCls, me.header || {});

        me.body = Ext.create(me.bodyCls, me.body || {});

        if (me.sidebar || me.hasSidebar) {

            me.layout = 'auto';

            me.cls = 'taco-content-container';

            me.main = Ext.create('Ext.Container', {
                // region: 'center',
                cls: Taco.baseCSSPrefix + 'content-container',
                // flex: 1,
                layout: 'auto',
                items: [me.header, me.body]
            });

            me.sidebar = me.sidebar || {};

            // create the sidebar unless some subclass has created it!
            if (!me.sidebar.$className) me.sidebar = Ext.widget('sidebar', me.sidebar);

            me.items = [me.main, me.sidebar];
        } else {
            me.layout = 'auto';
            me.cls = 'taco-content-container';
            me.items = [me.header, me.body];
        }
    },

    subscribeEvents: function() {
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
        if (this.ownerCt.destroyEverythingBut) this.ownerCt.destroyEverythingBut(this)
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