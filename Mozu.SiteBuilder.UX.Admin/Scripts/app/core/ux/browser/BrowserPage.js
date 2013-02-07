/**
 * @class Taco.core.ux.browser.BrowserPage
 * A classic index page for a collection of objects. Includes a sidebar where filters go.
 */
Ext.define('Taco.core.ux.browser.BrowserPage', {
    extend: 'Taco.core.ux.content.Container',
    alias: 'widget.browserpage',
    requires: ['Taco.core.ux.browser.BrowserPageBody'],
    bodyCls: 'Taco.core.ux.browser.BrowserPageBody',
    

    bubbleEvents: ['add', 'remove', 'save', 'cancel'],

    layout: {
        align: 'stretch',
        type: 'vbox'
    },

    cls: 'taco-content-container',

    flex: 1,
    body: {},
    header: {},

    initComponent: function () {
        var me = this;

        this.isScrolled = false;

        Ext.applyIf(this, {
            header: {},
            body: {}
        });

        me.header = Ext.create(me.headerCls, me.header);

        me.body = Ext.create(me.bodyCls, me.body);

        me.items = [me.header, me.body];

        me.callParent(arguments);

        me.subscribeEvents();

        Taco.app.eventbus.fireEvent("createpageview");
    },

    subscribeEvents: function() {
        var me = this;        me.mon(Taco.core.StateManager, {
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
        

    onAfterRender: function () {
        var me = this,
            isScrolled = this.isScrolled;
        me.body.getEl().addListener({
            scroll: function (e, t, eOpts) {
                if (!isScrolled && t.scrollTop > 0) {
                    isScrolled = true;
                    me.getEl().addCls('taco-content-scrolled');
                } else if (isScrolled && t.scrollTop === 0) {
                    isScrolled = false;
                    me.getEl().removeCls('taco-content-scrolled');
                }
                this.isScrolled = isScrolled;
            }
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