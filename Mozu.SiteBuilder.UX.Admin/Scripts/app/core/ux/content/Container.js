/**
 * @class Taco.core.ux.content.Container
 * It contains....everything
 */
Ext.define('Taco.core.ux.content.Container', {
    extend: 'Ext.container.Container',
    alias: 'widget.contentcontainer',
    requires: ['Taco.core.ux.content.Header','Taco.core.ux.content.Body'],
    headerCls: 'Taco.core.ux.content.Header', 
    bodyCls: 'Taco.core.ux.content.Body', 

    bubbleEvents: ['add', 'remove', 'save', 'cancel'],

    layout: {
        align: 'stretch',
        type: 'vbox'
    },

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
        Ext.applyIf(this, {
            header: {},
            body: {}
        });

        me.header = Ext.create(me.headerCls, me.header);

        me.body = Ext.create(me.bodyCls, me.body);

        me.items = [me.header, me.body];
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
        
    onBodyScroll: function (e, t, eOpts) {
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
        if (this.ownerCt.hideEverythingBut) this.ownerCt.hideEverythingBut(this)
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