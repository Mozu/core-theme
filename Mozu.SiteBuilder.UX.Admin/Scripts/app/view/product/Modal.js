/**
 * @class Taco.view.product.Modal
 */

Ext.define('Taco.view.product.Modal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.grid.Panel',
        'Ext.selection.CheckboxModel'
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

        this.grid = Ext.create('Ext.grid.Panel', {
            rootVisible: false,
            store: this.store,
            selModel: this.selModel,
            dockedItems: this.gridPager = Ext.create('Taco.core.ux.grid.Pager', {
                store: this.store
            }),
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
                    value = record.getContextualValue('price');
                    return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
                }
            }, {
                dataIndex: 'salePrice',
                text: 'Sale Price',
                width: 100,
                renderer: function (value, metaData, record) {
                    value = record.getContextualValue('salePrice');
                    return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
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

    primaryHandler: function () {
        var selection = this.selModel.getSelection();

        if (this.fireEvent('beforesave', this) !== false) {
            this.fireEvent('save', this, selection);
            this.close();
        }
    }
});
