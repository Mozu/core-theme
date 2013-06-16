/**
 * @class  Taco.view.account.Roles
 * The Roles grid view
 */

Ext.define('Taco.view.role.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.model.Role', 'Taco.store.Roles'],

    initComponent: function () {
        this.header = {
            title: 'Roles'
        };

        if (!this.store) {
            this.store = Ext.create('Taco.store.Roles', {
                autoLoad: true
            });
        }

        this.navigation = Ext.create('Taco.view.account.Navigation');

        this.grid = Ext.create('Taco.core.ux.BaseGrid', {
            store: this.store,
            listeners: {
                itemclick: this.onItemClick,
                deleterole: this.onDeleteRole,
                scope: this
            },
            layout: 'fit',
            columns: [{
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
            }],
            actions: [{
                tooltip: 'Delete',
                iconCls: 'taco-action-delete',
                eventName: 'deleterole'
            }]

        });
        
        this.body = {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                this.navigation,
                this.grid
            ]
        };

        this.header = {
            title: 'Roles',
            actions:  [{
                xtype: 'primarybutton',
                text: 'Create New Role',
                click: function () {
                    var record = new Taco.model.Role();
                    record.set('roledId', null);
                    this.launchEditor(record);
                    Taco.app.StateManager.addState('roles/create');
                },
                scope: this
            }]
        };

        this.callParent(arguments);

        this.store.load();

        this.on({
            afterrender: function () {
                if (this.record) {
                    this.launchLoadedEditor(this.record);
                }
            },
            scope: this
        });
    },

    addState: function (record) {
        var token = 'roles/edit/';

        if (!record || record.phantom) {
            token = 'roles/create';
        } else if (record.getId) {
            token += record.getId();
        }
        Taco.app.StateManager.addState(token);
    },

    launchEditor: function (record) {
        this.launchLoadedEditor(record);
    },

    launchLoadedEditor: function (record, formCfg) {
        var store = this.store,
            editorView;

        editorView = Ext.create('Taco.view.role.Edit', {
            logicalParent: this,
            formCfg: formCfg,
            listeners: {
                cancel: function () { 
                    Taco.core.StateManager.attemptNavigate('roles');
                },
                aftersave: function (editor, record, isEdit) {
                    
                    if (!isEdit) {
                        store.add(record);
                    }
                   
                    Taco.core.StateManager.attemptNavigate('roles');
                }
            },
            record: record
        });

        Taco.app.contentView.add(editorView);
    },

    onItemClick: function (view, record, item, index, e, eOpts) {
        if (e.target.className !== 'taco-launch-editor') {
            return;
        }

        e.preventDefault();
        this.addState(record);
        this.launchEditor(record);
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
        })
    }
});