/**
 * @class  Taco.view.searchTuningRule.PinnedProductForm
 * @description Search Tuning Rule Pinned Product Form
 */
Ext.define('Taco.view.searchTuningRule.PinnedProductForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-searchTuningRule-pinned',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.view.searchTuningRule.PinnedProductGrid'
    ],
    ui: 'subform',

    margin: '0 0 20 0',

    title: 'Promoted Products',
    config: {
        isCreateMode: false
    },

    initComponent: function() {

        var me = this;

        Ext.tip.QuickTipManager.init();

        me.pinnedGrid = Ext.create('Taco.view.searchTuningRule.PinnedProductGrid', {
            enableSearch: false
        });


        var productStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Products',
            createOnly: true,
            autoLoad: true,
            clearFilters: false,
            remoteFilter: false,
            filters: function (record) {
                //return Ext.Array.indexOf((me.get('categories') || []), record.getId()) > -1;
            }
        });

        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        me.productList = Ext.widget({
            xtype: 'combobox',
            name: 'categoryFilters',
            flex: 1,
            emptyText: 'Search for products',
            margin: '10 10 10 0',
            store: productStore,
            getStore: function () {
                return productStore;
            },
            queryMode: 'remote',
            lastQuery: '',
            hideTrigger: true,
            triggerOnClick: true,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            displayField: 'productName',
            valueField: 'productCode',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            },
            listeners: {
                select: function (cmp, record) {
                    me.pinnedGrid.fireEvent('recordadded', record);
                    cmp.setValue('');
                },
                scope: this
            }
        });

        me.placementSelect = Ext.create('Ext.form.ComboBox', {
            queryMode: 'local',
            displayField: 'text',
            valueField: 'value',
            forceSelection: true,
            margin: '10 0 10 10',
            store: Ext.create('Ext.data.Store', {
                fields: ['text', 'value'],
                data: [
                    { text: 'Insert at bottom', value: 'bottom' },
                    { text: 'Insert at top', value: 'top' },
                    { text: 'Insert above selected', value: 'above' },
                    { text: 'Insert below selected', value: 'below' }
                ]
            })
        })

        me.productForm = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'left'
            },
            defaults: {
                flex: 1
            },
            items: [ me.productList, me.placementSelect]
        })

        me.items = [
            {
                xtype: 'fieldcontainer',
                layout: 'fit',
                width: '100%',
                defaults: {
                    flex: 1
                },
                items: [
                    me.productForm,
                    me.pinnedGrid
                ]
            }
        ];

        me.callParent(arguments);
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});