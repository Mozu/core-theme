/**
 * @class Taco.core.ux.TreeList
 */
Ext.define('Taco.core.ux.TreeList', {
    extend: 'Ext.tree.Panel',
    requires: ["Ext.grid.column.Action", "Taco.core.ux.DragHandleColumn", "Taco.core.ux.QuickAdder", "Taco.core.ux.ClassHandledDragDrop", "Taco.core.ux.action.TreeListAction"],
    alias: 'widget.treelist',

    cls: 'taco-treelist',
    animate: false,
    collapsible: false,
    useArrows: true,
    lines: false,
    rootVisible: false,
    multiSelect: true,
    enableColumnResize: false,
    enableColumnMove: false,
    enableRowReorder: true,
    preventHeader: true,
    sortableColumns: false,
    autoSync: true,
    rowLines: true,
    viewConfig: {
        stripeRows: false
    },

    initComponent: function () {
        var me = this;

        Ext.applyIf(this.viewConfig, {
            overflowY: 'scroll',
            plugins: [{
                ptype: 'classhandleddragdrop'
            }]
        });
        


        if (this.columns[0].xtype !== 'draghandlecolumn' && this.enableRowReorder) { 

            this.columns.unshift({
                xtype: 'draghandlecolumn',
                width: 22
            });

            if (this.actions) {

                this.actions = this.actions.map(function (actionConf) {
                    return Ext.create('Taco.core.ux.action.TreeListAction', actionConf);
                });

                this.columns.push({
                    xtype: 'actioncolumn',
                    items: this.actions,
                    width: this.actions.length * 60
                });

                Ext.each(this.columns, function (col) {
                    Ext.applyIf(col, {
                        sortable: false,
                        hideable: false,
                        menuDisabled: true,
                        resizable: false
                    });
                });
            }
        }

        this.notifier = Ext.create('Ext.toolbar.TextItem', {
            cls: Taco.baseCSSPrefix + 'treelist-notifier',
            flex: 99,
            padding: '4 6'
        });

        this.callParent(arguments);

        this.mon(this, 'setmessage', function (text, type) {
            me.notifier.removeCls([Taco.baseCSSPrefix + 'message-status', Taco.baseCSSPrefix + 'message-warning', Taco.baseCSSPrefix + 'message-error']);
            me.notifier.addCls(Taco.baseCSSPrefix + 'message-' + type);
            me.notifier.setText(text);
            return false;
        });

    }
});
