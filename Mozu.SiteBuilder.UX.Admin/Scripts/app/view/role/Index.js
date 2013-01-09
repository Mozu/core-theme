

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

        this.store = Ext.create('Taco.store.Roles', {
            autoLoad: true
        });
        
        this.navigation = Ext.create('Taco.view.account.Navigation');

        this.grid = Ext.create('Taco.core.ux.BaseGrid', {
            store: this.store,
            listeners: {
                itemclick: this.onItemClick,
                scope: this
            },
            layout: 'fit',
            columns: [{
                xtype: 'gridcolumn',
                dataIndex: 'name',
                text: 'Name',
                flex: 1,
                renderer: function (value) {
                    return '<a href="#" class="taco-launch-editor">' + value + '</a>';
                }
            }]
        });

        //this.items = [this.grid];
        
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

    launchLoadedEditor: function (record) {
        var store = this.store,
            editorView;

        editorView = Ext.create('Taco.view.role.Edit', {
            logicalParent: this,
            listeners: {
                cancel: function () {
                    editorView.destroy();
                    Taco.core.StateManager.addState('roles');
                },
                aftersave: function (editor, record, isEdit) {
                    if (!isEdit) {
                        store.add(record);
                    }
                    editorView.destroy();
                    Taco.core.StateManager.addState('roles');
                }
            },
            record: record
        });

        Taco.app.contentView.add(editorView);
    },

    onItemClick: function (view, record, item, index, e) {
        if (!e.target.className === 'taco-launch-editor') {
            return;
        }
        e.preventDefault();
        this.addState(record);
        this.launchEditor(record);
    }
});