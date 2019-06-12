/**
 * @class Taco.core.ux.form.TabForm
 */
Ext.define('Taco.core.ux.form.TabFormNew', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco.tabformnew',
    requires: ['Taco.core.ux.grid.plugins.AutoSelect'],

    // this is an offset adjustment to move the left nav up and down relative to the first subForm's top edge.
    // By defaul the left nav will adjust itself to align with the top of the first subform;
    // this is primarily here to support the tabs in the product navform;
    leftNavTopOffset: 0,

    subPanelMinHeight: 240,

    numberOfTabsToShow: 6,

    initComponent: function () {

        var me = this;
        this.cls = this.cls || '';
        this.cls += ' taco-tabform';

        var originalItems = [];
        var excludedItems = [];

        Ext.Array.each(this.items, function (item, index) {
            if (!item) return;

            if (item.excludeFromNavigation) {
                excludedItems.push(item);
            } else {
                // add a minHeight to the panel so that the tabs have a panel to engage;
                //item.minHeight = this.subPanelMinHeight;
                originalItems.push(item)
            }
        });

        this.formContainer = Ext.widget({
            xtype: 'container',
            layout: {
                type: 'card',
                deferredRender: true
            },
            cls: '',
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
            fields: ['title', 'tabTitle', 'hidden']
        });

        this.leftNav = Ext.widget({
            xtype: 'dataview',
            store: this.navStore,
            itemId: 'navFormNav',
            cls: 'taco-form-nav-new',
            autoShow: true,
            itemSelector: '.taco-link-button',
            plugins: ["autoselect"],
            width: '100%',
            height: 39,
            selModel: Ext.create('Ext.selection.DataViewModel', {
                enableKeyNav: false
            }),
            listeners: {
                itemclick: function (view, record, item, index, e, eOpts) {
                    this.setActiveItemUI(item);
                    if (item && item.innerText != 'More Packages' && !item.className.includes('taco-link-button-packages-collapsable'))
                        this.onNavClick(view, record, item, index, e);
                },
                itemkeydown: function (view, record, item, index, e) {
                    if (e.getKey() == Ext.EventObject.ENTER) {
                        item.click();
                    }
                },
                viewready: function (obj) {

                    var d = obj.el.dom.getElementsByClassName('taco-link-more-container')[0];
                    Ext.create('Ext.button.Split', {
                        formContainer: me.formContainer,
                        menuAlign: 'tr-br?',
                        text: 'More Packages',
                        itemId: 'packagesSplitButton',
                        //handler: function () {
                        //    this.showMenu();
                        //},
                        menu: me.getMorePackagesMenu(me),
                        listeners: {
                            menushow: function (cmp, menu) {

                            }, scope: this
                        },
                        ui: 'action',
                        scale: 'medium',
                        margin: '0 2px 0 0',
                        renderTo: d
                    });
                    var collapse = obj.el.dom.getElementsByClassName('taco-link-collapsable')[0];
                    Ext.create('Ext.Button', {
                        cls: 'package-tab-details',
                        glyph: 'XE92A@mozicons',
                        width: 28,
                        ui: 'action',
                        scale: 'small',
                        margin: '0 10 0 0',
                        renderTo: collapse,
                        handler: function (button, event) {

                            if (me.formContainer.hidden) {
                                button.setGlyph('XE92A@mozicons');
                                me.formContainer.show(true);
                                me.shipmentTotals.show(true);
                            }
                            else {
                                button.setGlyph('XE927@mozicons');
                                me.formContainer.hide(true);
                                me.shipmentTotals.hide(true);
                            }
                        },
                    })
                },
                scope: this
            },
            tpl: [
                '<ul>',
                '<li tabIndex="0" class="taco-link-button taco-link-button-packages-collapsable"><div class="taco-link-collapsable"></div></li>',
                '<tpl for=".">',
                '<tpl if="xindex &lt;= ' + this.numberOfTabsToShow + '">',
                '<li tabIndex="1" class="taco-link-button <tpl if="xindex == 1">active</tpl> "><tpl if="values.tabTitle">{tabTitle}<tpl else>{title}</tpl></li>',
                '<tpl else>',
                '<li tabIndex="2" class="taco-link-button taco-link-button-more"><div class="taco-link-more-container"></div></li>',
                '{% break; %}',
                '</tpl>',
                '</tpl>',
                //'<tpl if="values.length &gt; ' + this.numberOfTabsToShow + '">',
                //'<li tabIndex="0" class="taco-link-button taco-link-button-more">More Packages{values.length}</li>',
                //'</tpl>',
                '</ul>',
                {
                    isVisible: function (values) {
                        return !values.hidden;
                    }
                }
            ]
        })

        this.scrollSpacer = Ext.widget({
            xtype: 'component',
            width: '100%',
            height: 0,
            html: ''
        });

        var items = excludedItems;
        items.push(this.leftNav);
        items.push(this.scrollSpacer);
        items.push(this.formContainer);

        //subtotals, orderlevel discounts, tax shipping, and totals
        this.shipmentTotals = Ext.create('Taco.view.order.widget.ShipmentTotalPanel', {
            margin: '0 0 20 0',
            record: this.record
        });

        items.push(this.shipmentTotals);

        this.items = items;

        this.callParent(arguments);

        this.nav = this.down('#navFormNav');
    },

    initPosition: function () {
        this.formContainer.getPosition();
    },    

    getWrapper: function () {
        if (!this._wrapper) {
            this._wrapper = Ext.ComponentQuery.query('fulleditor')[0];
        }
        return this._wrapper;
    },

    setActiveItemUI: function (item) {
        if (item) {
            Ext.each(this.getEl().query('li.active'), function (dom) {
                Ext.fly(dom).removeCls('active');
            });

            if (item)
                Ext.fly(item).focus().addCls('active');
        }
    },
    onNavClick: function (view, record, item) {
        if (record.raw.getEl && !item) {
            var panel = Ext.getCmp(record.get('id'));
            var layout = this.formContainer.getLayout();
            layout.setActiveItem(panel);
        }
        else {
            var layout = this.formContainer.getLayout();
            layout.setActiveItem(this.getItemIndex(item.innerText));
        }
    },

    getItemIndex: function (itemName) {
        for (var i = 0; i < this.formContainer.items.items.length; i++) {
            if (this.formContainer.items.items[i].tabTitle == itemName)
                return i;
        }
        return 0;
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
            this.leftNav.show();
        } else {
            this.formContainer.hide();
            this.leftNav.hide();
        }
    },

    isMoreTab: function () {
        if (this.numberOfTabsToShow && this.numberOfTabsToShow < this.navStore.data.items.length)
            return true;
        else
            return false;
    },

    getMorePackagesMenu: function (me) {
        var items = [];
        me.navStore.each(function (record, idx) {
            if (me.isMoreTab() && idx >= me.numberOfTabsToShow)
                items.push({
                    text: (record.get('tabTitle') ? record.get('tabTitle') : record.get('title')),
                    handler: function () { me.onNavClick(null, record); }
                });
        });
        return new Ext.menu.Menu({
            items: items
        })
    }

});