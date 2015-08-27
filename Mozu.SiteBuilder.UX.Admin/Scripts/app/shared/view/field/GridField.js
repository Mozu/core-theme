
/**
 * @class Taco.shared.view.field.Address
 * Display field that shows an address; Also will show a button to open address editor modal;
 * Supports adding additional components to the buttonContainer
 */

Ext.define('Taco.shared.view.field.GridField', {
    extend: 'Ext.form.field.Base',
    alias: 'widget.taco-gridfield',
    mixins: {
        labelable: 'Ext.form.Labelable',
        field: 'Ext.form.field.Field'
    },
    requires: [
     
    ],
    initComponent: function () {
        this.items =
        {
            xtype: 'grid',
            title: 'Friends',
            itemId: 'friendsGrid',
            columns: [
                {
                    dataIndex: 'name',
                    flex: 1,
                    text: 'name',
                    editor: {
                        allowBlank: false
                    }
                }
            ],
            store: Ext.create('Ext.data.Store', {
                fields: ['id', 'name']
            }),
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
            tbar: [
                {
                    text: 'Add Friend',
                    handler: function () {
                        this.up('grid').store.add({
                            name: ''
                        });
                    }
                }
            ]
        };
        me.initLabelable();
        me.initField();
    }
});
