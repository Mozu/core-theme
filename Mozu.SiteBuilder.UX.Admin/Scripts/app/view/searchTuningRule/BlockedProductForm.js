/**
 * @class  Taco.view.searchTuningRule.BlockedProductForm
 * @description Search Tuning Rule Blocked Product Form
 */
Ext.define('Taco.view.searchTuningRule.BlockedProductForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-searchTuningRule-blocked',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.view.searchTuningRule.BlockedProductGrid'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'Blocked Products',
    config: {
        isCreateMode: false
    },

    initComponent: function() {

        var me = this;

        Ext.tip.QuickTipManager.init();

        me.blockedGrid = Ext.create('Taco.view.searchTuningRule.BlockedProductGrid', {
            enableSearch: false
        });

        var productStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.Products',
            createOnly: true,
            autoLoad: false,
            clearFilters: false,
            remoteFilter: true,
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
                    me.blockedGrid.fireEvent('recordadded', record);
                    cmp.setValue('');
                },
                scope: this
            }
        });

        me.productForm = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'left'
            },
            defaults: {
                flex: 1
            },
            items: [ me.productList]
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
                    me.blockedGrid
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