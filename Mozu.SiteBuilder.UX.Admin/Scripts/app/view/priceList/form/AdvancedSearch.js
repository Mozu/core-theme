/**
 * @class Taco.view.priceList.form.AdvancedSearch
 */
Ext.define('Taco.view.priceList.form.AdvancedSearch', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.field.ComboBox',
        'Taco.core.ux.form.field.AdminUser',
        'Taco.store.CustomerSegments',
        'Ext.ux.form.field.BoxSelect',
        'Ext.form.FieldContainer',
        'Taco.core.ux.form.DateTime'
    ],

    defaults: {
        width:500,
        xtype: 'textfield'
    },

    initComponent: function () {
        var me = this,
            segmentStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerSegments', {
                autoLoad: false
            });

        me.customerSegmentStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : []
        });

        // had to use custom store so could map code to Id, used by filter,
        // without breaking changing to set idProperty of CustomerSegments to code
        segmentStore.load({
            scope: this,
            callback: function (records, operation, success) {
                if (!success)
                    return;
                var items = Ext.Array.map(records, function(record) {
                    return {
                        id: record.get('code'),
                        name: record.get('name')
                    };
                });
                this.customerSegmentStore.loadData(items);
            }
        });

        this.items = [
            {
                name: 'keyword',
                fieldLabel: 'Keyword Search',
                width: '100%'
            }
        ];

        this.items = this.items.concat([
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                items: [
                    me.createStaticCombobox('status', 'Status', [
                        {
                            name: 'Active',
                            id: 'Active'
                        }, {
                            name: 'Disabled',
                            id: 'Disabled'
                        }, {
                            name: 'All',
                            id: 'All'
                        }
                    ], 0)]
            },
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                items: [
                    {
                        xtype: 'combobox',
                        store: me.customerSegmentStore,
                        name: 'segments',
                        fieldLabel: 'Segments',
                        width: '100%',
                        valueField: 'id',
                        displayField: 'name',
                        queryMode: 'local',
                        valueNotFoundText: 'not found',
                        editable: true,
                        forceSelection: true
                    }
                ]
            }
        ]);

        this.callParent(arguments);
    },

    createStaticCombobox: function(name, label, data, marginRight) {
        return {
            xtype: 'combobox',
            name: name,
            fieldLabel: label,
            margin: { right: marginRight },
            width: '100%',
            valueField: 'id',
            displayField: 'name',
            queryMode: 'local',
            valueNotFoundText: 'not found',
            editable: false,
            forceSelection: true,
            trigger2Cls: 'x-form-clear-trigger',
            onTrigger2Click: function () {
                this.clearValue();
            },
            store: Ext.create('Ext.data.Store', {
                fields: ['id', 'name'],
                data: data
            })
        };
    },

    launchSegmentModal: function (list) {
        var gridStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.CustomerSegments',
            clearFilters: true,
            clearSort: true,
            autoLoad: true
        });

        this.modal = Ext.create('Taco.view.customers.segments.Modal', {
            store: gridStore,
            listeners: {
                savesuccess: function (modal, values) {
                    list.addValue(values);
                },
                scope: this
            }
        });
    }
});