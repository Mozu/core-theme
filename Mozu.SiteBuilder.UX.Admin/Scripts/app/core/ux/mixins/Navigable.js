/**
 * @class  Taco.core.ux.mixins.Navigable
 * @author Travis Johnson
 * @description Adds navigation to forms
 */
// Note: I ran in to an insidious bug with this mixin and spent  many hours trying to run it down to no avail.
// reverting users of the mixin to the NavForm2 base class since it doesn't have the issue;
// steps to reproduce the bug:
/*
  load a discout
  go back to grid
  load the discount again.
  after the view loads it deselects the active item in the nav.
  It appears to be related to updates to the form fields but I couldn't isolate the issue;




  // Note: this mixin has been depricated;

*/


Ext.define('Taco.core.ux.mixins.Navigable', {
    //sectionOffset: 39,
    //topOffset: 39,

    sectionOffset: 39,
    topOffset: 39,

    enableScrollSpy: true,

    constructor: function (cfg) {
        var view,
            container;

        this.navStore = Ext.create('Ext.data.Store', {
            fields: ['title', "hidden"]
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

        this.leftNav = this.nav = this.down('#navFormNav');

        this.mon(this, {
            boxready: function () {
                this.initLeftNav(arguments)
            },
            add: this.loadNavItems,
            remove: this.loadNavItems,
            scope: this
        });
    },

    //getWrapper: function () {
    //    if (!this.wrapper) {
    //        this.wrapper = Taco.app.viewPort.down('contentbody');
    //    }
    //    return this.wrapper;
    //},
    getWrapper: function () {
        var wrapper = Ext.ComponentQuery.query('fulleditor')[0];
        // need to find the fulleditor class since it is the scroll container;
        return wrapper;

        /*
        if (!this.wrapper) {
            this.wrapper = Taco.app.viewPort.down('contentbody');
        }

        return this.wrapper || this;
        */
    },

    initLeftNav: function () {

        if (!this.enableScrollSpy) return;

        // need to realign the left nav to account for the top navHeader height change after layout;
        this.leftNav.el.alignTo(this.el, "tl-tl", [0, 0]);

        //this.getWrapper().on({
        this.mon(this.getWrapper(), {
            afterlayout: function () {
                this.getWrapper().body.el.dom.scrollTop = this._scrollTop || 0;
                this.rebuildMap();
            },
            scope: this
        });

        this.mon(this.getWrapper().body.el, {
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
        var scrollTop = this.getWrapper().body.el.dom.scrollTop,
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
        li = this.nav.getEl().query('li')[max];

        // don't need to make a change if the active one is already selected;
        if (active && active.dom == li) {
            return;
        }

        if (active) {
            active.removeCls('active');
        }


        if (!li) return;

        Ext.fly(li).addCls('active');
    },

    onNavClick: function (view, record) {
        var wrapper = this.getWrapper().body.el,
            targetY;

        if (record.raw.getEl) {
            targetY = view.store.indexOf(record) ? record.raw.getEl().dom.offsetTop + this.sectionOffset : 0;
            wrapper.scrollTo('top', targetY - this.topOffset, true);
        }
    },

    loadNavItems: function () {
        var recordsToAdd = [];

        // need to cull hidden panels from the store so that the dataview doesn't mismatch the record to the item clicked;  It currently uses index position and the hidden records are causing the mismatch;
        this.items.each(function (item) {
            if (!item.showHideNavWatch) {

                item.mon(item, {
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