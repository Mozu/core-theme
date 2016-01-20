/**
 * @class Taco.view.order.subform.InternalNotes
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.subform.InternalNotes', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.InternalNotesGrid'
    ],
    
    title: 'Internal Notes',
    ui: 'subform-section',
    bodyPadding: '20 0 40 0',

    layout: 'card',

    initComponent: function () {
        var me = this;

        this.store = this.record.getInternalNotes();

        this.grid = Ext.create('Taco.view.order.widget.InternalNotesGrid', {
            record: this.record,
            store: this.store
        });

        this.tools = [{
            xtype: 'button',
            ui: 'action',
            scale: 'medium',
            text: 'Add Note',
            scope: this.grid,
            handler: this.grid.onRowEditorCreate
        }];

        this.items = [{
                xtype: 'component',
                cls: 'order-no-content',
                html: 'N/A'
            },
            this.grid
        ];

        this.activeTab = this.store.count() > 0 ? 1 : 0;

        this.callParent(arguments);
    },


    onDestroy: function () {
        Ext.destroy(this.notesDialog);

        this.callParent(arguments);
    },

    refreshGrid: function () {
        this.down('grid').getView().refresh();

        this.getLayout().setActiveItem(this.store.count() > 0 ? 1 : 0);
    }
});
