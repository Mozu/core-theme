/**
 * @class Taco.view.order.subform.InternalNotes
 */

// todos extend base class for the subform
Ext.define('Taco.view.order.subform.InternalNotes', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.InternalNotesGrid'
    ],
    
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.internal_notes,
    ui: 'subform-section',
    bodyPadding: '20 0 40 0',
    cls: 'taco-grid-hide-more-btn', // this hides the combobox that is used to show/hide columns

    layout: 'card',
    orderUpdateBehaviors: [{
                                model: 'Taco.model.Order',
                                behavior: 'update'
                            },
                            {
                                model: 'Taco.model.Order',
                                behavior: 'updateItem'
                            },
                            {
                                model: 'Taco.model.Order',
                                behavior: 'updatePrice'
                            },
                            {
                                model: 'Taco.model.Order',
                                behavior: 'updateDiscount'
                            },
                            {
                                model: 'Taco.model.Order',
                                behavior: 'updateAttribute'
                            },
                            {
                                model: 'Taco.model.Order',
                                behavior: 'manualAdjustment'
                            }
            ],
    initComponent: function () {
        var me = this;

        this.store = this.record.getInternalNotes();

        this.grid = Ext.create('Taco.view.order.widget.InternalNotesGrid', {
            record: this.record,
            store: this.store
        });

        if (this.record.get('isUnified')) {
            this.tools = [{
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                text: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.add_internal_notes,
                scope: this.grid,
                requiredBehaviors: this.orderUpdateBehaviors,
                handler: function () {
                    this.changeCards(1);
                    this.grid.onRowEditorCreate();
                },
                scope: this
            }];
        }

        this.items = [{
                xtype: 'component',
                cls: 'order-no-content',
                html: 'N/A'
            },
            this.grid
        ];

        this.activeTab = this.store.count() > 0 ? 1 : 0;

        this.callParent(arguments);

        this.mon(this.store, 'load', this.changeCards, this);
        this.on('boxready', this.changeCards, this);
    },


    onDestroy: function () {
        Ext.destroy(this.notesDialog);

        this.callParent(arguments);
    },

    refreshGrid: function () {
        this.down('grid').getView().refresh();

        this.changeCards();
    },

    changeCards: function (value) {
        var activeItem = (typeof value === 'number') ? value : (this.store.count() > 0 ? 1 : 0);
        this.getLayout().setActiveItem(activeItem);
    }
});
