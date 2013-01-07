/**
 * @class Taco.view.fileManagement.TilePanel
 */
Ext.define('Taco.view.fileManagement.TilePanel', {
    extend: 'Taco.core.ux.TilePanel',

    initComponent: function () {
        var me = this;

        me.callParent(arguments);
        // me.editor = new Ext.Editor({
        //     shadow: false,
        //     field: {
        //         xtype: 'textfield'
        //     }
        // });
        // me.editor.on('complete', function (editor, value, previous) {
        //     if (value != previous) {
        //         editor.record.set('name', value);
        //         editor.record.save();
        //     }
        // });

        // me.callParent(arguments);

        // me.on({
        //     'edit': {
        //         fn: function (v, record, item, index, e, eOpts) {
        //             dom = Ext.get(item).down('.name');
        //             me.editor.completeEdit();
        //             me.editor.startEdit(dom);
        //             me.editor.record = record;
        //         },
        //         scope: me
        //     }
        // });
    }
});