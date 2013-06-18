/**
 * @class Taco.view.product.Modal
 */
Ext.define('Taco.view.product.Modal', {
    extend: 'Ext.window.Window',
    requires: ['Ext.grid.Panel', 'Ext.selection.CheckboxModel'],
   height:500,
    autoShow: true,
   width: 700,
    layout: {
        type: 'vbox',
        align:'left'
    },
    initComponent: function () {
        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            checkOnly: true,
            showHeaderCheckbox: true
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            width: 690,
            flex:1,
            //height: 120,
            margin: '28 0 0 0',
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

        this.content = {
            xtype: 'container',
            
            layout: 'fit',
            flex:1,
            items: [this.grid]
        };

        //this.actions = {
        //    xtype: 'container',
        //    items: [{
        //        xtype: 'primarybutton',
        //        text: 'Apply',
        //        click: this.save,
        //        scope: this
        //    }, {
        //        xtype: 'action',
        //        text: 'Cancel',
        //        click: this.cancel,
        //        scope: this
        //    }]
        //};

        this.items = [this.content];
        this.dockedItems = [{
            xtype: 'toolbar',
            dock: 'bottom',
            layout: {
                type:'hbox',
                align:'right'
            },
            items: ['->', {
                    xtype: 'primarybutton',
                    text: 'Apply',
                    click: this.save,
                    scope: this
                }, {
                    xtype: 'action',
                    text: 'Cancel',
                    click: this.cancel,
                    scope: this
                }]
        }];

        this.callParent(arguments);

        this.grid.getView().on({
            viewready: this.preselect,
            scope: this
        });

        this.selModel.on({
            selectionchange: function(selModel, selection) {
                 console.log(selection, selModel.getSelectionMode());
            },
            scope: this
        });
    },

    cancel: function () {
        this.hide();
    },

    preselect: function (view) {
        var preselection = this.preselection,
            grid = this.grid;

        Ext.Array.each(preselection, function (record) {
            var recordInGridStore = grid.store.getById(record.getId());
            grid.getSelectionModel().select(recordInGridStore);
        }, this);
    },

    save: function (button, e) {
        var selection = this.selModel.getSelection(),
            values;


        this.fireEvent('save', this, selection);

        this.hide();
    }
});