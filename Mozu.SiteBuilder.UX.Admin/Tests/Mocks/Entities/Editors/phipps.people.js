Ext.create('Ext.form.Panel', {
    title: 'A Preson',
    requires: ['Ext.data.UuidGenerator', 'Ext.window.MessageBox'],


    // Fields will be arranged vertically, stretched to full width
    layout: 'anchor',
    defaults: {
        anchor: '100%'
    },

    // The fields
    defaultType: 'textfield',
    items: [
        {
            fieldLabel: 'guid',
            name: 'guid',
            allowBlank: false,
            readOnly: true
        }, {
            fieldLabel: 'Name',
            name: 'name'
        }, {
            fieldLabel: 'favoriteFruit',
            name: 'favoriteFruit'
        }, {
            fieldLabel: 'age',
            name: 'age'
        },
        {
            fieldLabel: 'balance',
            name: 'balance'
        }, {
            xtype: 'fieldset',
            title: 'picture',
            items: [
                {
                    xtype: 'field',
                    //fieldLabel: 'picture',
                    name: 'picture',
                    fieldSubTpl: ['<img src="{value}" width=100 />'],
                }, {
                    xtype: 'button',
                    text: 'change',
                    listeners: {
                        click: function (cmp) {

                            Ext.Msg.prompt('enter url', '', function (res, text) {
                                console.log(text);
                                cmp.up('form').getForm().findField('picture').setValue(text);
                            }, cmp, false, cmp.up('form').getForm().findField('picture').getValue());
                        }
                    }
                }
            ]
        }, {
            xtype: 'boxselect',
            fieldLabel: 'tags',
            name: 'tags',
            store: [],
            "queryMode": 'local',
            "forceSelection": false,
            "createNewOnEnter": true,
            "createNewOnBlur": true,

        }, {
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
        }
    ],


    listeners: {
        render: function (cmp) {
            this.down('#friendsGrid').store.loadData(this.data.friends || []);

        }
    },

    setData: function (data) {
        data.guid = data.guid || Ext.data.IdGenerator.get('uuid').generate();

        this.getForm().setValues(data);
        this.data = data;
    },
    getData: function () {

        var data = this.getValues(false, false, false, true);
        data.friends = Ext.pluck(this.down('#friendsGrid').store.data.items, 'data');

        return Ext.applyIf(data, this.data);

    },


});