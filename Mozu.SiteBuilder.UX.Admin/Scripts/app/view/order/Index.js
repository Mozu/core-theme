/**
 * @class Taco.view.order.Index
 */
Ext.define('Taco.view.order.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.model.Order', 'Taco.view.order.Grid', 'Taco.view.order.Edit'],

    initComponent: function () {
        var me = this;

        this.header = {
            title: 'Orders'
        };

        this.store = Ext.create('Ext.data.Store', {
            model: 'Taco.model.Order',
            remoteSort: true,
            remoteFilter: true,
            pageSize: 25
        });

        this.gridpanel = Ext.create('Taco.view.order.Grid', {
            store: this.store
        });

        Ext.apply(me.body, {
            layout:'fit',
            items: [me.gridpanel]
        });

        this.callParent(arguments);

        this.gridpanel.on({
            itemclick: {
                fn: this.onItemClick,
                scope: this
            }
        });

        this.store.load();
    },

    launchEditor: function (record) {
        var me = this,
            editorView;

        editorView = Ext.create('Taco.view.order.Edit', {
            logicalParent: me,
            recordId: record
        });

        Taco.app.contentView.add(editorView);
    },

    onItemClick: function (view, record, elm, index, e) {
        // console.log(e.target);
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.launchEditor(record);
            Taco.app.StateManager.addState('orders/edit/' + record.get('orderNumber'), { id: record.getId() });
        }
    }
});