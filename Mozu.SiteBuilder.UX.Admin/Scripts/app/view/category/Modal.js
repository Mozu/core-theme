/**
 * @class Taco.view.category.Modal
 */
Ext.define('Taco.view.category.Modal', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Ext.tree.Panel', 'Ext.selection.CheckboxModel'],

    autoShow: true,
    width: 700,

    initComponent: function () {
        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            checkOnly: true,
            showHeaderCheckbox: true
        });

        this.tree = Ext.create('Ext.tree.Panel', {
            width: 644,
            height: 120,
            margin: '28 0 0 0',
            rootVisible: false,
            store: this.store,
            displayField: 'name',
            selModel: this.selModel
        });

        this.content = {
            xtype: 'container',
            items: [{
                xtype: 'component',
                cls: Taco.baseCSSPrefix + 'modal-title',
                html: 'Select Categories'
            }, this.tree]
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

        this.preselect();
    },

    cancel: function () {
        this.hide();
    },

    preselect: function () {
        var preselection = this.preselection,
            tree = this.tree;

        Ext.Array.each(preselection, function (record) {
            var path = record.get('path');
            console.log(path);
            // tree.selectPath(path);
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