/**
 * @class  Taco.view.account.Roles
 * The Roles grid view
 */

Ext.define('Taco.view.role.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    requires: ['Taco.model.Role', 'Taco.store.Roles'],

    modelName: 'Taco.model.Role',
    store: { type: 'Taco.store.Roles' },
    editorName: 'Taco.view.role.Edit',

    // this is the title. 
    typeName: "Roles",

    initComponent: function () {       
        
        if (!this.store) {
            this.store = Ext.create('Taco.store.Roles', {
                autoLoad: true
            });
        }

        this.gridPanelConf = {
         //   store: this.store,
            listeners: {
               // itemclick: this.onItemClick,
                deleterole: this.onDeleteRole,
                scope: this
            },
            layout: 'fit',
            columns: [
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'name',
                    text: 'Name',
                    flex: 1,
                    renderer: function (value, metaData, record) {

                        if (record.get('isEditable')) {
                            return '<a href="#" class="taco-launch-editor">' + value + '</a>';
                        } else {
                            return value;
                        }
                    }
                }
            ],
            actions: [
                {
                    tooltip: 'Delete',
                    iconCls: 'taco-action-delete',
                    eventName: 'deleterole'
                }
            ]

        };
        
       

        this.callParent(arguments);

       // this.store.load();

       
    },

   

    onDeleteRole: function (view, index, idx, action, e, record) {
        Ext.create('Taco.core.ux.modal.Confirmation', {
            autoShow: true,
            content: {
                html: 'Are you sure you want to delete this role?'
            },
            listeners: {
                confirm: function () {
                    this.store.remove(record);
                    this.store.sync();
                },
                scope: this
            }
        });
    }
});