/**
 * @class Taco.view.product.Modal
 */

Ext.define('Taco.view.product.Modal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.grid.Panel',
        'Ext.selection.CheckboxModel',
        'Taco.view.product.AdvancedSearchForm',
        'Taco.core.ux.form.FilterContainer'
    ],

    autoShow: true,
    closeAction: 'destroy',
    primaryText: 'Apply',
    scale: 'large',
    title: 'Select Products',

    layout: {
        type: 'fit'
    },

    initComponent: function () {
        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            checkOnly: true,
            showHeaderCheckbox: true
        });

        this.advancedSearchForm = Ext.create('Taco.view.product.AdvancedSearchForm');


        this.searchBox = Ext.widget({
            xtype: 'taco-filtercontainer',
            width: '100%',
            flex: 1,
            advancedForm: this.advancedSearchForm,
           // advancedFormCls: me.advancedSearchConfig.advancedFormCls,
            store: this.store,
            filterStores: this.advancedSearchForm.stores,
            doc:'top'
        });
        this.gridPager = Ext.create('Ext.toolbar.Paging', {
            store: this.store,
            displayInfo: true,
            dock: 'bottom'
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            rootVisible: false,
            store: this.store,
            selModel: this.selModel,
            dockedItems: [
                this.searchBox,
                this.gridPager
            ],
            columns: [{
                dataIndex: 'productCode',
                text: 'Code',
                width: 100
            }, {
                dataIndex: 'productName',
                text: 'Name',
                minWidth: 120,
                resizable: false,
                flex: 1,
                renderer: function (value, metaData, record) {
                    return record.getContextualValue('productName');

                }
            }, {
                dataIndex: 'price',
                text: 'Price',
                width: 70,
                renderer: function (value, metaData, record) {
                    return record.getContextualValue('price', true)|| '--';
                   
                }
            }, {
                dataIndex: 'salePrice',
                text: 'Sale Price',
                width: 100,
                renderer: function (value, metaData, record) {
                    return record.getContextualValue('salePrice', true) || '--';
                }
            }]
        });

        this.items = [this.grid];

        this.callParent(arguments);

        this.grid.getView().on({
            viewready: {
                scope: this,
                fn: 'preselect'
            }
        });
    },

    preselect: function (view) {
        var preselection = this.preselection,
            grid = this.grid;

        Ext.Array.each(preselection, function (record) {
            var recordInGridStore = grid.store.getById(record.getId());
            grid.getSelectionModel().select(recordInGridStore);
        }, this);
    },

    doSave: function () {
        var selection = this.selModel.getSelection();
        this.saveSuccess(selection);
    }
});
