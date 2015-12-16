/**
 * @class Taco.core.ux.form.Form
 */
Ext.define('Taco.core.ux.form.NavForm2', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.navform2',
    requires: [],

    // Sure would have been nice to have some comments for what this does...
    //sectionOffset: 38,

    // Sure would have been nice to have some comments for what this does...
    //topOffset: 38,

    // whether or not the sectionNav sticks to the viewport
    enableScrollSpy: true,

    // this is the fine-tuning adjustment to move the section nav when it 'sticks'
    sectionNavTopOffset: 0,

    // determines the positioning strategy for the stickyNav, true applies the 'taco-fixed-navForm2' class, false applies 'taco-relative-navForm2'
    useFixedPosition: true,

//    layout : "fit",

    
    //cls: "taco-navform2",

    //padding: "20 20 10 20",

    initComponent: function () {
        var me = this;
        this.cls = this.cls || "";
        this.cls += " taco-navform2";
        
        
        
        // items from subclass
        var originalItems =  [];
        var excludedItems = [];

        Ext.Array.each(this.items, function (item, index) {
            if (item.excludeFromNavigation) {
                excludedItems.push(item);
            } else {
                originalItems.push(item)
            }
        });

        this.stickyClass = (this.useFixedPosition) ? 'taco-fixed-navForm2' : 'taco-relative-navForm2';

        this.formContainer = Ext.widget({
            xtype: 'container',
            cls: 'taco-form-nav-container',
            //cls: "taco-content-navcontainer-padding",
            //bodyStyle:"padding:20px",
            items: originalItems
        });

        this.relayEvents(this.formContainer, ['add']);

        this.navStore = Ext.create('Ext.data.Store', {
            fields: ['title','hidden']
        });


        this.sectionNav = Ext.widget({
            xtype: 'dataview',
            store: this.navStore,
            itemId: 'navFormNav',
            cls: 'taco-form-nav',
            autoShow: true,
            itemSelector: '.taco-link-button',
            listeners: {
                itemclick: this.onNavClick,
                scope: this
            },
            tpl: [
                '<ul>',
                    '<tpl for=".">',
                        '<tpl if="this.isVisible(values)">',
                            '<li class="taco-link-button">{title}</li>',
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
        
        me.dockedItems = me.dockedItems || [];
        me.dockedItems.push(this.sectionNav)

        
        var items = excludedItems;
        items.push(this.formContainer)
        
        this.items = items;

        this.callParent(arguments);

        this.nav = this.down('#navFormNav');
        
        this.on({
            boxready: this.initSectionNav,
            scope: this
        });
    },

    getWrapper: function () {
        var wrapper = Ext.ComponentQuery.query('fulleditor')[0];
        // need to find the fulleditor class since it is the scroll container;
        return wrapper;
    },

    getHeaderHeight: function() {
        var wrapper = this.getWrapper();
        return wrapper.getY() + (wrapper.header ? wrapper.header.getHeight() : 0);
    },

    initSectionNav: function() {

        if (!this.enableScrollSpy) return;

        var wrapper = this.getWrapper();
        var headerHeight = this.getHeaderHeight();

        wrapper.on({            
            afterlayout: this.rebuildMap,
            scope: this
        });

        wrapper.body.el.on({
            scroll: this.checkTop,
            scope: this
        });

        this.navTop = this.sectionNav.getY() - headerHeight;

    },

    rebuildMap: function () {
        
        this.locationMap = [];
        this.recordMap = [];

        if (!this.nav || !this.nav.store) return;

                
        this.formContainerTop = (this.formContainer.el && this.formContainer.el.dom) ? this.formContainer.el.dom.offsetTop : 0;


        this.nav.store.each(function (record, index) {
            var el = record.raw.getEl();

            if (!el) return;

            this.recordMap.push(record);

            if (index === 0) {
                this.locationMap.push(0);
                return;
            }            
            //this.locationMap.push(el.dom.offsetTop + this.sectionOffset - this.topOffset - this.leftNavTopOffset);
            this.locationMap.push(el.dom.offsetTop - this.sectionNavTopOffset - (this.formContainerTop || 0));
            //this.locationMap.push(el.dom.offsetTop);


        }, this);

        this.checkTop();
    },

    getTop: function() {
        return this.getWrapper().body.el.dom.scrollTop;
    },

    checkTop: function () {
        this.stickNav();
        this.updateActiveNavItem();

    },

    stickNav: function() {
        var scrollTop = this.getTop();
        var sectionNav = this.sectionNav;
        var navTop = this.navTop; // set in this.initSectionNav

        if (scrollTop > navTop) {
            var headerHeight = this.getHeaderHeight();
            sectionNav.addCls(this.stickyClass);
            if (this.useFixedPosition) {
                sectionNav.getEl().dom.style.top = headerHeight + this.sectionNavTopOffset + 'px';
            } else {
                sectionNav.getEl().dom.style.top = (scrollTop - headerHeight + this.sectionNavTopOffset) + 'px';
            }
        }
        else if (scrollTop < navTop) {
            sectionNav.removeCls(this.stickyClass);
            sectionNav.getEl().dom.style.top = '0px';
        }

    },

    updateActiveNavItem: function() {
        var scrollTop = this.getTop(),
            max,
            li,
            active;

        if (this.isHidden()) return;
        
        

        Ext.each(this.locationMap, function (top, index) {
            if (Math.round(scrollTop) >= top) max = index;
            else return false;
        }, this);

        if (!this.nav.rendered) return;

        active = this.nav.getEl().down('.active');

        if (active) active.removeCls('active');

        li = this.nav.getEl().query('li')[max];

        if (!li) return;

        Ext.fly(li).addCls('active');
    },

    onNavClick: function (view, record, item, index, e, eOpts) {
        var wrapper = this.getWrapper().body.el,
            targetY;
        
        if (record.raw.getEl) {
            targetY = view.store.indexOf(record)
                ? record.raw.getEl().dom.offsetTop
                : 0;
            wrapper.scrollTo('top', targetY, true);
        }
    },

    loadNavItems: function (items) {
        var components,
            recordsToAdd = [];
        
        if (items) {
            //this.formContainer.autoDestroy = false;
            this.formContainer.removeAll();
            //this.formContainer.autoDestroy = true;
            //destroy itemsToRemoved
            components = this.formContainer.add(items);
        } else {
            components = this.formContainer.items.items;
        }

        // need to cull hidden panels from the store so that the dataview doesn't mismatch the record to the item clicked;  It currently uses index position and the hidden records are causing the mismatch;
        Ext.Array.each(components, function (item) {
            
            if (!item.hidden) {
                recordsToAdd.push(item);
            }
        });

        this.navStore.loadRawData(recordsToAdd);
    }
});