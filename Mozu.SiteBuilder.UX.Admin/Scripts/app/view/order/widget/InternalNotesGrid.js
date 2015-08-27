/**
 * @class Taco.view.order.subform.InternalNotes
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.widget.InternalNotesGrid', {
    extend: 'Ext.grid.Panel',
    mixins: {
        rowEditable: 'Taco.core.ux.mixins.RowEditable'
    },

    enableRowEditing: true,

    viewConfig: {
        emptyText: 'No items to display',
        deferEmptyText: false
    },

    // need to have a minHeight for autoHeight grids that use a row editor. TODO: create override to fix the rowEditor so it can escape the autoHeight grid;
    minHeight: 110,

    columns: [{
        dataIndex: 'text',
        text: 'Comment',
        flex: 4,
        nowrap: false,
        editor: {
            xtype: 'textfield',
            maxLength: 250,
            enforceMaxLength: true
        },
        renderer: function (value, meta) {
            meta.style = 'white-space: normal';
            return value;
        }
    }],

    initComponent: function () {
        this.mixins.rowEditable.constructor.apply(this);

        this.callParent(arguments);

        this.on({
            beforeedit: {
                scope: this,
                fn: 'handleBeforeEdit'
            },
            validateedit: {
                scope: this,
                fn: 'handleValidateEdit'
            }
        });
    },

    /**
     * [handleBeforeEdit description]
     * @param  {[type]} editor  [description]
     * @param  {[type]} context [description]
     * @return {[type]}         [description]
     */
    handleBeforeEdit: function (editor, context) {
        context.cancel = !context.record.phantom;

        if (context.cancel) return false;
    },

    handleValidateEdit: function (editor, context) {
        context.cancel = true;

        context.record.set({
            'orderId': this.record.get('id'),
            'text': context.newValues.text
        });

        editor.cancelEdit();

        this.getStore().add(context.record);

        this.getView().refresh();

        this.getStore().sync();
    }
});