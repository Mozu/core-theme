/**
 * @class Taco.core.ux.form.TabForm
 */
Ext.define('Taco.core.ux.form.TabForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.tabform',
    requires: ['Taco.core.ux.grid.plugins.AutoSelect'],

    // this is an offset adjustment to move the left nav up and down relative to the first subForm's top edge.
    // By defaul the left nav will adjust itself to align with the top of the first subform;
    // this is primarily here to support the tabs in the product navform;
    leftNavTopOffset: 0,

    subPanelMinHeight : 240,

    initComponent: function () {
        var me = this;
        this.cls = this.cls || "";    
        this.cls += " taco-tabform";

        var originalItems = [];
        var excludedItems = [];

        Ext.Array.each(this.items, function (item, index) {
            if (item.excludeFromNavigation) {
                excludedItems.push(item);
            } else {
                // add a minHeight to the panel so that the tabs have a panel to engage;
                //item.minHeight = this.subPanelMinHeight;
                originalItems.push(item)
            }
        })

        this.formContainer = Ext.widget({
            xtype: 'container',
            layout: {
                type: 'card',
                deferredRender: true
            },
            cls: 'taco-form-tabform-nav-container',
            items: originalItems,
            listeners: {
                scope: me,
                beforeadd: function (view, component, index, eOpts) {                    
                    // add a minHeight to the panel so that the tabs have a panel to engage;
                    component.minHeight = me.subPanelMinHeight;
                }
            }
        });

        this.relayEvents(this.formContainer, ['add']);

        this.navStore = Ext.create('Ext.data.Store', {
            fields: ['title', "tabTitle", "hidden"]
        });

        this.leftNav = Ext.widget({
            xtype: 'dataview',            
            store: this.navStore,
            itemId: 'navFormNav',
            cls: 'taco-form-tabform-nav',
            autoShow: true,
            itemSelector: '.taco-form-tabform-nav-link',
            plugins: ["autoselect"],
            selModel: Ext.create('Ext.selection.DataViewModel',{
                enableKeyNav : false
            }),
            listeners: {                
                itemclick: function (view, record, item, index, e, eOpts) {
                    this.onNavClick(view, record, item, index, e);
                    Ext.fly(item).focus();
                },                
                itemkeydown: function (view, record, item, index, e) {
                    if (e.getKey() == Ext.EventObject.ENTER) {
                        item.click();
                    }
                },
                scope: this
            },
            tpl: [
                '<ul>',
                    '<tpl for=".">',
                        //'<tpl if="this.isVisible(values)">',
                            '<li tabIndex="0" class="taco-form-tabform-nav-link"><tpl if="values.tabTitle">{tabTitle}<tpl else>{title}</tpl></li>',
                        //'</tpl>',
                    '</tpl>',
                '</ul>',
                {
                    isVisible: function (values) {
                        return !values.hidden;
                    }
                }
            ]
        })

        
        

        

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
    },

    alignLeftNav: function () {        
        var offset = this.leftNav.el.getAlignToXY(this.formContainer.el, "tr-tl", [0, 0]);
        
        // need to account for scrolling when this gets realigned;
        var scrollTop = this.getWrapper().body.el.dom.scrollTop;
        var y = offset[1] + this.leftNavTopOffset + scrollTop;
        //this.leftNav.el.moveTo(null, offset[1] + this.leftNavTopOffset)
        this.leftNav.el.moveTo(null, y)
        if (this.leftNav.store.count()) {
            //this.leftNav.show();
            //this.formContainer.show();
        } else {
            //this.leftNav.hide();
            //this.formContainer.hide();
        }

    },

    initLeftNav: function () {
        
        this.alignLeftNav();
        this.getWrapper().on({
            resize: function () {                

            },
            scope: this
        });
        
        if (this.leftNav.store.count()) {
            this.leftNav.getSelectionModel().select(0);
        }
    },

    onNavClick: function (view, record) {
        var wrapper = this.getWrapper().body.el,
            targetY;

        if (record.raw.getEl) {
            var panel = Ext.getCmp(record.get("id"));
            var layout = this.formContainer.getLayout();
            
            layout.setActiveItem(panel);

            /*
            targetY = view.store.indexOf(record)
                        ? record.raw.getEl().dom.offsetTop + this.sectionOffset - this.leftNavTopOffset
                        : 0;
            wrapper.scrollTo('top', targetY - this.topOffset, true);
            */
        }
    },

    loadNavItems: function (items) {
        var components,
            recordsToAdd = [],
            previousSelectedForm;

        // need to determine the current selection before reloading the nav;
        var selection = this.leftNav.getSelectionModel().getSelection();
        if (selection && selection.length) {
            previousSelectedForm = selection[0];
        }


        if (items) {
            this.formContainer.removeAll();
            components = this.formContainer.add(items);
        } else {
            components = this.formContainer.items.items;
        }

        // need to cull hidden panels from the store so that the dataview doesn't mismatch the record to the item clicked;  It currently uses index position and the hidden records are causing the mismatch;
        Ext.Array.each(components, function (item) {
            recordsToAdd.push(item);
        });

        this.navStore.loadRawData(recordsToAdd);

        if (this.navStore.count()) {
            this.formContainer.show();
        } else {
            this.formContainer.hide();  
        }
    }
});