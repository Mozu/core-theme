Ext.create('Ext.form.Panel', {
    title: 'A Preson',
    requires: ['Ext.data.UuidGenerator'],


    // Fields will be arranged vertically, stretched to full width
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },

    // The fields
    defaultType: 'textfield',
    items: [{
        fieldLabel: 'guid',
        name: 'guid',
        allowBlank: false,
        readOnly: true
    }, {
        fieldLabel: 'Name',
        name: 'name',
        allowBlank: false
    }, {
        fieldLabel: 'favoriteFruit',
        name: 'favoriteFruit',
        allowBlank: true
    }, {
        fieldLabel: 'age',
        name: 'age'
    }, {
        xtype: 'grid',
        itemId: 'friendsGrid',
        columns: [{
            dataIndex: 'name',
            flex: 1,
            text: 'name',
            editor: {
                allowBlank: false
            }
        }],
        store: Ext.create('Ext.data.Store', {
            fields: ['id', 'name']
        }),
        plugins: [
            Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1
            })
        ],
        tbar: [{
            text: 'Add Friend',
            handler: function() {
                this.up('grid').store.add({
                    name: ''
                });
            }
        }]
    }],


    listeners: {
        render: function(cmp) {
            this.down('#friendsGrid').store.loadData(this.data.friends || []);

        }
    },

    setData: function(data) {
        data.guid = data.guid || Ext.data.IdGenerator.get('uuid').generate();
        this.getForm().setValues(data);
        this.data = data;
    },
    getData: function() {

        var data = this.getValues(false, false, false, true);
        data.friends = Ext.pluck(this.down('#friendsGrid').store.data.items, 'data');

        return Ext.applyIf(data, this.data);

    },



});