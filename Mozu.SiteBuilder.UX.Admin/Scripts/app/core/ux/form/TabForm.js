/**
 * @class Taco.core.ux.form.TabForm
 */
Ext.define('Taco.core.ux.form.TabForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.tabform',
    requires: [],
//    sectionOffset: 39,
///    topOffset: 0,
//    enableScrollSpy: true,

    layout:'card',

    initComponent: function () {

        // items from subclass
        var originalItems = this.items || [];



        //this.relayEvents(this.formContainer, ['add']);

        this.navStore = Ext.create('Ext.data.Store', {
            fields: ['title',"hidden"]
        });

        this.dockedItems = [{
            xtype: 'dataview',
            dock: "left",
            width: 400,
            style: "background-color:red",
            store: this.navStore,
            itemId: 'navFormNav',
            //cls: 'taco-form-nav',
            //autoShow: true,
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
        }]


        /*

        this.items = [            
            this.formContainer
        ];

        this.callParent(arguments);

        this.nav = this.down('#navFormNav');
        
        /*
        this.on({
            afterrender: this.onAfterRender,
            scope: this
        });
        */

        


        this.callParent(arguments);

    },

    getWrapper: function () {
        if (!this.wrapper) {
            this.wrapper = Taco.app.viewPort.down('contentbody');
        }
        return this.wrapper;
    },

    onAfterRender: function () {

       /*
        if (!this.enableScrollSpy) return;

        this.getWrapper().on({
            afterlayout: this.rebuildMap,
            scope: this
        });
        */
        /*
        this.getWrapper().getEl().on({
            scroll: this.checkTop,
            scope: this
        });
        */

      //  this.rebuildMap();
    },
    /*
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
    */

    onNavClick: function (view, record) {
        var wrapper = this.getWrapper().getEl(),
            targetY;
        

        var panel = Ext.getCmp(record.get("id"));
        this.getLayout().setActiveItem(panel);

        /*
        if (record.raw.getEl) {
            targetY = view.store.indexOf(record)
                        ? record.raw.getEl().dom.offsetTop + this.sectionOffset
                        : 0;
            wrapper.scrollTo('top', targetY - this.topOffset, true);
        }
        */
    },
    

    loadNavItems: function (items) {
        
        var components,
            recordsToAdd = [];

        if (items) {
            //this.formContainer.autoDestroy = false;
            this.removeAll();
            //this.formContainer.autoDestroy = true;
            //destroy itemsToRemoved
            components = this.add(items);
        } else {
            components = this.items.items;
        }

        // need to cull hidden panels from the store so that the dataview doesn't mismatch the record to the item clicked;  It currently uses index position and the hidden records are causing the mismatch;
        Ext.Array.each(components, function(item) {
            if (!item.hidden) {
                recordsToAdd.push(item);
            }
        });

        this.navStore.loadRawData(recordsToAdd);
    }
});