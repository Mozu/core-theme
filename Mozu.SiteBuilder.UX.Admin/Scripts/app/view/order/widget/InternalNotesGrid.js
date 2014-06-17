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

    columns: [{
        xtype: 'datecolumn',
        dataIndex: 'date',
        text: 'Date',
        format: 'm/d/Y h:ia',
        flex: 1,
        editor: {
            xtype: 'datefield',
            format: 'm/d/Y h:ia'
        }
    }, {
        dataIndex: 'agent',
        text: 'Agent',
        flex: 1,
        editor: {
            xtype: 'textfield'
        }
    }, {
        dataIndex: 'comment',
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
    }
});
