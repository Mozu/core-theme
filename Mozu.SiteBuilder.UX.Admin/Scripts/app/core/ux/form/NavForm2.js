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

    // this is an offset adjustment to move the left nav up and down relative to the first subForm's top edge.
    // By defaul the left nav will adjust itself to align with the top of the first subform;
    // this is primarily here to support the tabs in the product navform;
    leftNavTopOffset: 0,

    
    enableScrollSpy: true,

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
        })



        this.formContainer = Ext.widget({
            xtype: 'container',
            cls: 'taco-form-nav-container',
            //cls: "taco-content-navcontainer-padding",
            //bodyStyle:"padding:20px",
            items: originalItems
        });

        this.relayEvents(this.formContainer, ['add']);

        this.navStore = Ext.create('Ext.data.Store', {
            fields: ['title',"hidden"]
        });


        
        this.leftNav = Ext.widget({
            xtype: 'dataview',
            //dock: 'left',
            //width:100,
            //style: "margin-top: 51px",
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
        })
        
        //me.dockedItems = me.dockedItems || [];
        //me.dockedItems.push(this.leftNav)

        
        var items = excludedItems;
        items.push(this.leftNav)
        items.push(this.formContainer)
        
        this.items = items;




        this.callParent(arguments);

        

        this.nav = this.down('#navFormNav');
        
        this.on({
            boxready: this.initLeftNav,
            scope: this
        });
    },

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

    alignLeftNav: function () {
        var offset = this.leftNav.el.getAlignToXY(this.formContainer.el, "tr-tl", [0, 0]);

        // need to account for scrolling when this gets realigned;
        var scrollTop = this.getWrapper().body.el.dom.scrollTop;
        var y = offset[1] + this.leftNavTopOffset + scrollTop;
        //this.leftNav.el.moveTo(null, offset[1] + this.leftNavTopOffset)
        this.leftNav.el.moveTo(null, y)
    },

    initLeftNav: function () {
        if (!this.enableScrollSpy) return;

        this.getWrapper().on({            
            afterlayout: this.rebuildMap,
            scope: this
        });

        this.getWrapper().body.el.on({
            
            scroll: this.checkTop,
            scope: this
        });
        
        this.alignLeftNav();
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
            this.locationMap.push(el.dom.offsetTop - this.leftNavTopOffset - this.formContainerTop);
            //this.locationMap.push(el.dom.offsetTop);


        }, this);

        this.checkTop();
    },

    checkTop: function () {
        
        var scrollTop = this.getWrapper().body.el.dom.scrollTop,
            max,
            li,
            active;

        if (this.isHidden()) return;
        
        

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
        var wrapper = this.getWrapper().body.el,
            targetY;
        
        if (record.raw.getEl) {
            targetY = view.store.indexOf(record)
            //? record.raw.getEl().dom.offsetTop + this.sectionOffset - this.leftNavTopOffset
                ? record.raw.getEl().dom.offsetTop - this.formContainerTop - this.leftNavTopOffset
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