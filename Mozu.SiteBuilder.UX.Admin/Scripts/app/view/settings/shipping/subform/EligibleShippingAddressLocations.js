Ext.define('Taco.view.settings.shipping.subform.EligibleShippingAddressLocations', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    title: 'Eligible Shipping Address Locations',
    ui: 'subform',
    record: null,

    initComponent: function() {
        var me = this;

        var store = Ext.create('Taco.store.States2');

        me.grid = Ext.create('Ext.grid.Panel', {
            width: 760,
            padding: '15 0 0 0',
            columns: [{
                xtype: 'gridcolumn',
                flex: 2,
                dataIndex: 'name',
                text: 'State',
                hideable: false
            }, {
                xtype: 'gridcolumn',
                flex: 1,
                dataIndex: 'code',
                text: 'Code',
                hideable: false
            }],
            selModel: {
                selType: 'checkboxmodel',
                mode: 'MULTI',
                headerWidth: 37
            },
            flex: 1,
            //ui: 'dc-grid-panel',
            border: true,
            store: store,
            dockedItems: [{
                xtype: 'pagingtoolbar',
                store: store,
                dock: 'bottom',
                displayInfo: true,
                border: '0 1 1'
            }]
        });

        /*
        me.hiddenSelectedStates = Ext.create('Ext.form.field.Hidden', {
            xtype: 'hiddenfield',
            name: 'hiddenselectedStates'
        });
        */

        me.items = [me.grid];
        me.callParent(arguments);
        me.grid.getSelectionModel().mon(me.grid, 'selectionchange', me.onSelectionChange, me);

        store.mon(store, 'load', function () {
            var initSelections = null;

            Ext.each(me.record.get('enabledStates'), function (code, idx, list) {
                if (code != Ext.emptyString) {
                    if (!initSelections) {
                        initSelections = [];
                    }
                    initSelections.push(store.getById(code));
                }
            });

            if (initSelections) {
                me.grid.getSelectionModel().select(initSelections);
            }
        }, me);
    },

    onSelectionChange: function (selmodel, selected, opts) {
        var me = this;
        var idList = [];

        Ext.each(selected, function (country, idx, list) {
            idList.push(country.getId());
        });

        //me.countriesField.setValue(idList);
        me.record.set('enabledStates', idList);
    }
});