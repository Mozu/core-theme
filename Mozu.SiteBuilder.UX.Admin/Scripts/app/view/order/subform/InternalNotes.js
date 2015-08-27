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

    initComponent: function () {
        var me = this;

        this.store = this.record.getInternalNotes();

        // this.store = Ext.create('Ext.data.Store', {
        //     autoLoad: true,
        //     fields: [{
        //         type: 'date', name: 'date',
        //     }, {
        //         type: 'string', name: 'agent',
        //     }, {
        //         type: 'string', name: 'comment'
        //     }],
        //     data: [{
        //         date: Ext.Date.parse('01/01/2014 07:43am', 'm/d/Y h:ia'),
        //         agent: 'Patsy OrderProcessor',
        //         comment: 'I called the customer and let them know the widget is backordered.'
        //     }, {
        //         date: Ext.Date.parse('01/02/2014 05:19pm', 'm/d/Y h:ia'),
        //         agent: 'Cody CustomerCare',
        //         comment: 'I spoke to Joe and let him know that I will cancel the widget and that it will be reflected on his CC within 3 days.'
        //     }]
        // });

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

        this.items = [this.grid];

        this.callParent(arguments);
    },

    // openNotesDialog: function () {
    //     if (this.notesDialog) {
    //         this.notesDialog.show();
    //     } else {
    //         this.notesDialog = Ext.create('Taco.core.ux.window.Modal', {
    //             autoShow: true,
    //             scale: 'large',
    //             title: 'Internal Notes',
    //             overflowY: 'auto',
    //             closeAction: 'hide',
    //             layout: {
    //                 type: 'vbox',
    //                 align: 'stretch'
    //             },
    //             items: [this.grid],
    //             listeners: {
    //                 savesuccess: {
    //                     scope: this,
    //                     fn: function () {
    //                         var me = this;
    //                         var orderForm = this.orderForm;

    //                         console.log('todo: wire up saving of internal notes');

    //                         // orderForm.setLoading(true, orderForm.body);

    //                         // // rely on the subform's "beforeSave" method to save attributes to the model correctly.
    //                         // orderForm.orderAttr.beforeSave();

    //                         // orderForm.record.saveAttributes({
    //                         //     success: function () {
    //                         //         orderForm.setLoading(false, orderForm.body);

    //                         //         me.refreshGrid();
    //                         //     },
    //                         //     failure: function (msg) {
    //                         //         orderForm.setLoading(false, this.body);
                                    
    //                         //         var res = Ext.JSON.decode(msg.responseText);
                                   
    //                         //         Taco.app.fireEvent('setmessage', res.items[0].message, 'error', orderForm);
    //                         //     }
    //                         // });
    //                     }
    //                 }
    //             }
    //         });
    //     }
    // },

    onDestroy: function () {
        Ext.destroy(this.notesDialog);

        this.callParent(arguments);
    },

    refreshGrid: function () {
        this.down('grid').getView().refresh();
    }
});
