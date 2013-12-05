/**
 * @class  Taco.core.ux.mixins.Navigable
 * @author Travis Johnson
 * @description Adds navigation to forms
 */
Ext.define('Taco.core.ux.mixins.Navigable', {
    sectionOffset: 39,
    topOffset: 39,
    enableScrollSpy: true,

    constructor: function (cfg) {
        var view,
            container;

        this.navStore = Ext.create('Ext.data.Store', {
            fields: ['title',"hidden"]
        });

        view = Ext.widget({
            xtype: 'dataview',
            store: this.navStore,
            itemId: 'navFormNav',
            cls: 'taco-form-nav',
            autoShow: true,
            itemSelector: '.taco-form-nav-link',
            listeners: {
                itemclick: this.onNavClick,
                scope: this
            },
            tpl: [
                '<ul>',
                    '<tpl for=".">',
                        '<tpl if="this.isVisible(values)">',
                            '<li class="taco-form-nav-link">{title}</li>',
                        '</tpl>',
                    '</tpl>',
                '</ul>',
                {
                    isVisible: function (values) {
                        return !values.hidden;
                    }
                }
            ]
        });

        container = Ext.widget({
            xtype: 'container',
            itemId: 'nav-form-container',
            dock: 'left',
            width: 180,
            margin: '0 30 0 0',
            items: [view]
        });

        this.addDocked(container);

        this.nav = this.down('#navFormNav');

        this.on({
            afterrender: this.onAfterRender,
            add: this.loadNavItems,
            remove: this.loadNavItems,
            scope: this
        });
    },

    getWrapper: function () {
        if (!this.wrapper) {
            this.wrapper = Taco.app.viewPort.down('contentbody');
        }
        return this.wrapper;
    },

    onAfterRender: function () {

        if (!this.enableScrollSpy) return;

        this.getWrapper().on({
            afterlayout: this.rebuildMap,
            scope: this
        });

        this.getWrapper().getEl().on({
            scroll: this.checkTop,
            scope: this
        });

        this.loadNavItems();
    },

    rebuildMap: function () {
        this.locationMap = [];
        this.recordMap = [];

        if (!this.nav || !this.nav.store) return;

        this.nav.store.each(function (record, index) {
            var el = record.raw.getEl();

            if (!el) return;

            this.recordMap.push(record);

            if (index === 0) {
                this.locationMap.push(0);
                return;
            }

            this.locationMap.push(el.dom.offsetTop + this.sectionOffset - this.topOffset);
        }, this);

        this.checkTop();
    },

    checkTop: function () {

        var scrollTop = this.getWrapper().getEl().dom.scrollTop,
            max,
            li,
            active;

        if (this.isHidden()) return;

        this._scrollTop = scrollTop;

        Ext.each(this.locationMap, function (top, index) {
            if (scrollTop >= top) max = index;
            else return false;
        }, this);

        if (!this.nav.rendered) return;

        active = this.nav.getEl().down('.active');

        if (active) active.removeCls('active');

        li = this.nav.getEl().query('li')[max];

        if (!li) return;

        Ext.fly(li).addCls('active');
    },

    onNavClick: function (view, record) {
        var wrapper = this.getWrapper().getEl(),
            targetY;

        if (record.raw.getEl) {
            targetY = view.store.indexOf(record)
                        ? record.raw.getEl().dom.offsetTop + this.sectionOffset
                        : 0;
            wrapper.scrollTo('top', targetY - this.topOffset, true);
        }
    },

    loadNavItems: function () {
        var recordsToAdd = [];

        // need to cull hidden panels from the store so that the dataview doesn't mismatch the record to the item clicked;  It currently uses index position and the hidden records are causing the mismatch;
        this.items.each(function(item) {
            if (!item.showHideNavWatch) {
                item.on({
                    show: this.loadNavItems,
                    hide: this.loadNavItems,
                    scope: this
                });
                item.showHideNavWatch = true;
            }

            if (!item.hidden) {
                recordsToAdd.push(item);
            }
        }, this);

        this.navStore.loadRawData(recordsToAdd);

        this.rebuildMap();
    }
});