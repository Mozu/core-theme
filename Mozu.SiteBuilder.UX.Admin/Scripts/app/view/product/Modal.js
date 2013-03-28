/**
 * @class Taco.view.product.Modal
 */
Ext.define('Taco.view.product.Modal', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Ext.grid.Panel', 'Ext.selection.CheckboxModel'],

    autoShow: true,
    width: 700,

    initComponent: function () {
        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            checkOnly: true,
            showHeaderCheckbox: true
        });

        this.grid = Ext.create('Ext.grid.Panel', {
            width: 644,
            height: 120,
            margin: '28 0 0 0',
            rootVisible: false,
            store: this.store,
            selModel: this.selModel,
            columns: [{ text: 'Name',  dataIndex: 'productName' }]
        });

        this.content = {
            xtype: 'container',
            items: [{
                xtype: 'component',
                cls: Taco.baseCSSPrefix + 'modal-title',
                html: 'Select Products'
            }, this.grid]
        };

        this.actions = {
            xtype: 'container',
            items: [{
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
        };

        this.callParent(arguments);

        this.grid.getView().on({
            viewready: this.preselect,
            scope: this
        });

        this.selModel.on({
            selectionchange: function (selModel, selection) { console.log(selection, selModel.getSelectionMode()); },
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

        // values = Ext.Array.map(selection, function (record) {
        //     return { id: record.getId(), name: record.get('name') };
        // }, this);
        
        console.log(selection);

        this.fireEvent('save', this, selection);

        this.hide();
    }
});