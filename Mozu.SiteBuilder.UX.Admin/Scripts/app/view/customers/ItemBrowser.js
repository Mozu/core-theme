/**
 * @class Taco.view.customers.ItemBrowser
 */
Ext.define('Taco.view.customers.ItemBrowser', {
    extend: 'Taco.core.ux.browser.ItemBrowser',
    alias: 'widget.customersbrowser',
    requires: ['Ext.data.Store', 'Taco.view.customers.SearchForm', 'Taco.core.util.RangeFilter'],

    initComponent: function () {
        var me = this;

        me.filterStore = Ext.create(Ext.data.Store, {
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

        me.searchform = Ext.create('Taco.view.customers.SearchForm', {
            width: 600,
            height: 400,
            padding: 20,
            searchButton: {
                xtype: 'button',
                text: 'filter',
                margin: '10 0 0',
                handler: function () {
                    me.applyFilters(me.searchform.down('formpanel').getValues(false, false, false, true));
                    me.down('boxselect').setValue(me.filterStore.collect('key'));
                    me.searchform.hide();
                }
            }
        });

        me.dockedItems = [{
            xtype: 'toolbar',
            dock: 'top',
            items: [{
                xtype: 'boxselect',
                name: 'boxsearch',
                width: 600,
                minChars: 2,
                cls: 'taco-boxselect',
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
                    change: function (field, newValue, oldValue) {
                        var n = newValue ? newValue.split(', ') : [],
                            o = oldValue ? oldValue.split(', ') : [],
                            diff = Ext.Array.difference(o, n);

                        if (diff.length > 0) {
                            me.filterStore.remove(me.filterStore.findRecord('key', diff[0]));
                            //me.searchform.down('#' + diff[0]).reset();
                            me.itemStore.clearFilter();
                            me.itemStore.filter(me.filterStore.collect('filter'));
                        }
                    }
                }
            }]
        }];

        me.callParent(arguments);

        me.on({
            destroy: function () { me.searchform.destroy(); },
            scope: me
        });

        // disable boxselect text input
        // pending direction on functionality from ux
        me.down('boxselect').on({
            render: function () {
                this.getEl().down('.x-boxselect-input-field').set({ disabled: 'disabled' });
            }
        });
    },

    applyFilters: function (data) {
        var me = this,
            newFilters = [];

        if (data.customerName) {
            me.addFilter('Name', 'Name is ' + data.customerName, Ext.create('Ext.util.Filter', {
                property: 'customerName',
                value: data.customerName,
                root: 'data'
            }));
        }

        if (data.acceptsMarketing !== null) {
            me.addFilter('AcceptsMarketing', 'Does' + (data.acceptsMarketing ? '' : 'n\'t') + ' accept marketing', Ext.create('Ext.util.Filter', {
                property: 'acceptsMarketing',
                value: data.acceptsMarketing,
                root: 'data'
            }));
        }

        if (data.city) {
            me.addFilter('City', 'City is ' + data.city, Ext.create('Ext.util.Filter', {
                property: 'city',
                value: data.city,
                root: 'data'
            }));
        }

        if (data.stateOrProvince) {
            me.addFilter('State', 'State is ' + data.stateOrProvince, Ext.create('Ext.util.Filter', {
                property: 'stateOrProvince',
                value: data.stateOrProvince,
                root: 'data'
            }));
        }

        if (data.zipCode) {
            me.addFilter('ZipCode', 'Zip code is ' + data.zipCode, Ext.create('Ext.util.Filter', {
                property: 'postalOrZipCode',
                value: data.zipCode,
                root: 'data'
            }));
        }

        if (data.spendRangeHigh && data.spendRangeLow) {
            me.addFilter('Spent', 'Spent between ' + data.spendRangeLow + ' and ' + data.spendRangeHigh, Ext.create('Ext.util.Filter', {
                filterFn: function (item) {
                    return data.spendRangeLow >= item.spent && item.spent <= data.spendRangeHigh;
                }
            }));
        }

        switch(data.range) {
            case 'Today':
                me.addFilter('Dates', 'Orders placed today', Ext.create('Taco.core.util.RangeFilter', {
                    today: true,
                    property: 'lastOrderedOn'
                }));
                break;
            case 'Yesterday':
                me.addFilter('Dates', 'Orders placed yesterday', Ext.create('Taco.core.util.RangeFilter', {
                    yesterday: true,
                    property: 'lastOrderedOn'
                }));
                break;
            case 'LastWeek':
                me.addFilter('Dates', 'Orders placed last week', Ext.create('Taco.core.util.RangeFilter', {
                    lastWeek: true,
                    property: 'lastOrderedOn'
                }));
                break;
            case 'LastMonth':
                me.addFilter('Dates', 'Orders placed last month', Ext.create('Taco.core.util.RangeFilter', {
                    lastMonth: true,
                    property: 'lastOrderedOn'
                }));
                break;
            case 'Custom':
                if (data.lastOrderRangeHigh && data.lastOrderRangeLow) {
                    var low = Ext.Date.format(data.lastOrderRangeLow, 'M j, Y'),
                        high = Ext.Date.format(data.lastOrderRangeHigh, 'M j, Y');
                    me.addFilter('Dates', 'Last order placed between ' + low + ' and ' + high, Ext.create('Taco.core.util.RangeFilter', {
                        startDate: data.lastOrderRangeLow,
                        endDate: data.lastOrderRangeHigh,
                        property: 'lastOrderedOn'
                    }));
                }
                break;
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