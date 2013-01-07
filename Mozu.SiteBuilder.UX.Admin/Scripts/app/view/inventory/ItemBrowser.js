/**
 * @class Taco.view.inventory.ItemBrowser
 */
Ext.define('Taco.view.inventory.ItemBrowser', {
    extend: 'Taco.core.ux.ItemBrowser',
    alias: 'widget.inventorybrowser',

    initComponent: function () {
        var me = this;

        me.filterStore = Ext.create('Ext.data.Store', {
            fields: [{
                name: 'key',
                type: 'string'
            }, {
                name: 'displayName',
                type: 'string'
            }, {
                name: 'filter',
                type: 'auto'
            }],
            data: []
        });

        me.searchform = Ext.create('Ext.container.Container', {
            width: 500,
            height: 300,
            padding: 10,
            floating: true,
            shadow: false,
            cls: Taco.baseCSSPrefix + 'floating-formpanel',
            items: [{
                xtype: 'formpanel',
                bodyPadding: '0 10',
                title: 'Search by:',
                defaults: {
                    xtype: 'textfield',
                    labelAlign: 'top',
                    labelSeparator: ''
                },
                items: [{
                    xtype: 'textfield',
                    name: 'productName',
                    itemId: 'productName',
                    fieldLabel: 'Product Name',
                    width: 200
                }, {
                    xtype: 'textfield',
                    name: 'category',
                    fieldLabel: 'Category',
                    width: 200
                }, {
                    xtype: 'fieldcontainer',
                    fieldLabel: 'Inventory Level',
                    labelAlign: 'top',
                    labelSeparator: '',
                    layout: 'hbox',
                    items: [{
                        xtype: 'selectfield',
                        name: 'inventoryCriterion',
                        width: 200,
                        mode: 'local',
                        valueField: 'storedValue',
                        displayField: 'storedValue',
                        store: Ext.create('Ext.data.ArrayStore', {
                            fields: [{
                                name: 'storedValue',
                                type: 'string'
                            }],
                            data: [['Less than'], ['Out of stock'], ['Unlimited (not tracked)']]
                        }),
                        listeners: {
                            afterrender: function (select) {
                                if (select.value === null) {
                                    select.setValue(select.store.getAt(0).get('storedValue'));
                                }
                            },
                            select: function (field, records) {
                                var val = records[0].get('storedValue'),
                                    amountField = field.up('fieldcontainer').down('textfield[name="inventoryAmount"]');

                                if (val !== 'Less than') {
                                    amountField.hide().disable();
                                } else {
                                    amountField.show().enable();
                                }
                            }
                        }
                    }, {
                        xtype: 'numberfield',
                        name: 'inventoryAmount',
                        itemId: 'stockOnHand',
                        width: 50,
                        margin: '0 0 0 20',
                        decimalPrecision: 0,
                        hideTrigger: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false
                    }]
                }, {
                    xtype: 'button',
                    text: 'filter',
                    margin: '10 0 0',
                    handler: function () {
                        me.applyFilters(me.searchform.down('formpanel').getValues(false, false, false, true));
                        me.down('boxselect').setValue(me.filterStore.collect('key'));
                        me.searchform.hide();
                    }
                }]
            }]
        });

        me.dockedItems = [{
            xtype: 'toolbar',
            dock: 'top',
            items: [{
                xtype: 'boxselect',
                name: 'boxsearch',
                width: 500,
                minChars: 2,
                cls: Taco.baseCSSPrefix + 'boxselect',
                store: me.filterStore,
                displayField: 'displayName',
                valueField: 'key',
                shortField: 'displayName',
                triggerOnClick: false,
                pinList: false,
                onTriggerClick: function () {
                    var xy = this.getPosition();

                    if (me.searchform.isVisible()) {
                        me.searchform.hide();
                    } else {
                        me.searchform.showAt(xy[0], xy[1] + this.getHeight());
                    }
                },
                listeners: {
                    // *** Use remote filtering method of superclass
                    change: this.onKeyUp,
                    // change: function (field, newValue, oldValue) {
                    //     var n = newValue ? newValue.split(', ') : [],
                    //          o = oldValue ? oldValue.split(', ') : [],
                    //          diff = Ext.Array.difference(o, n);

                    //     if (diff.length > 0) {
                    //          me.filterStore.remove(me.filterStore.findRecord('key', diff[0]));
                    //          me.searchform.down('#' + diff[0]).reset();
                    //          me.itemStore.clearFilter();
                    //          me.itemStore.filter(me.filterStore.collect('filter'));
                    //     }
                    // },
                    render: function () {
                        var productNameInput = me.searchform.down().getComponent('productName'),
                            comboTextInput = this.getEl().down('.x-boxselect-input-field');
                        comboTextInput.on({
                            keyup: function (extEvent, textInput) {
                                productNameInput.setValue( textInput.value );
                            }
                        });
                    },
                    // *** Handles a user typing in boxselect and pressing 'enter' instead of using advanced search form
                    specialkey: function (combobox, evt) {
                        // *** 'Enter' pressed
                        if( evt.getKey() == 13 ) {
                            // *** Fake a click event on me.searchform's filter button
                            me.searchform.down('button').getEl().dom.click();

                            // *** Clear the boxsearch's text input
                            this.getEl().down('.x-boxselect-input-field').dom.value = '';
                        }
                    }
                }
            }]
        }];

        me.callParent(arguments);

        me.on({
            render: function () {
                // *** Force Ext to create the relevant components by briefly showing the container outside of the viewport
                this.searchform.showAt(-1e4, 0);
                this.searchform.hide();
            },
            destroy: function () { this.searchform.destroy(); },
            scope: me
        });

        // disable boxselect text input
        // pending direction on functionality from ux
        // Update 10/17/2012: Enabled by request of Scott Hanagriff
        // me.down('boxselect').on({
        //     render: function () {
        //         // this.getEl().down('.x-boxselect-input-field').set({ disabled: 'disabled' });
        //         var textinput = this.down('.x-boxselect-input-field');
        //         console.log("textinput", textinput);
        //     }
        // });
    },

    applyFilters: function (data) {
        var me = this,
            newFilters = [];

        // filter stock
        switch (data.inventoryCriterion) {
            case 'Less than':
                if (data.inventoryAmount >= 1) {
                    me.addFilter('stockOnHand', 'stock is less than ' + data.inventoryAmount, Ext.create('Ext.util.Filter', {
                        filterFn: function (item) {
                            return item.get('stockOnHand') !== null && item.get('stockOnHand') < data.inventoryAmount;
                        },
                        root: 'data'
                    }));
                }
                break;
            case 'Out of stock':
                me.addFilter('stockOnHand', 'is out of stock', Ext.create('Ext.util.Filter', {
                    property: 'stockOnHand',
                    value: 0,
                    root: 'data'
                }));
                break;
            case 'Unlimited (not tracked)':
                me.addFilter('stockOnHand', 'stock is unlimited', Ext.create('Ext.util.Filter', {
                    property: 'stockOnHand',
                    value: null,
                    root: 'data'
                }));
                break;
        }

        // filter name
        if (data.productName.length >= 1) {
            me.addFilter('productName', 'name begins with ' + data.productName, Ext.create('Ext.util.Filter', {
                property: 'productName',
                value: data.productName,
                root: 'data'
            }));
        }

        // filters for gridpanel
        // we should be able to update/replace filters by id
        // they are stored in a MixedCollection "filters" on the grid's store
        // but that's all broken so we have to clearFilter(), then filter()
        me.itemStore.clearFilter();
        me.filterStore.each(function (record) {
            newFilters.push(record.get('filter'));
        });
        me.itemStore.filter(newFilters);

        // update filter stores to force component refreshes
        me.down('boxselect').valueStore.loadRecords(me.filterStore.getRange(), {
            addRecords: false
        });
    },

    addFilter: function (field, displayName, filter) {
        var me = this,
            activeFilter = null;

        activeFilter = me.filterStore.findRecord('key', field);

        if (activeFilter) {
            me.filterStore.remove(activeFilter);
        }
        me.filterStore.add({
            key: field,
            displayName: displayName,
            filter: filter
        });
    }
});