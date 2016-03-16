/**
 * The Price List form
 */
Ext.define('Taco.view.priceList.Form', {
    extend: 'Taco.core.ux.form.NavForm2',
    requires: [
        'Taco.view.priceList.form.General',
        'Taco.view.priceList.form.Resolution',
        'Taco.view.priceList.entry.Entries',
        'Taco.core.ux.card.Tab',
        'Taco.core.ux.card.Toolbar'
    ],
    autoDestroy: true,
    itemId: 'taco-priceList-form',

    createTitle: 'New Price List',
    editTitle: '{[values.record.data.name]}',
    isCatalogLevel: false,
    categoryCode: null,
    isCreate: false,
    modelName: 'Taco.model.PriceList',

    initComponent: function () {
        var me = this,
            model;
        // Note: the record will act as an event bus for the subForms.
        // User interactions in a subform that cause changes in other forms will communicate via events on the record.
        // Each subform will listen for and react to these changes.

        me.sectionNavTopOffset = me.isPopUp ? -12 : 9;

        this.items = [{
            xtype: 'taco-priceList-general',
            itemId: 'general',
            parentForm: this,
            record: me.record,
            manageHeight: true
        }, {
            xtype: 'taco-priceList-resolution',
            itemId: 'resolution',
            parentForm: this,
            record: me.record,
            manageHeight: true
        }, {
            xtype: 'taco-priceList-entries',
            itemId: 'entries',
            parentForm: this,
            record: me.record,
            manageHeight: true
        }
        ];

        if (this.isCatalogLevel) {
            this.header = false;
        }
        model = Ext.ModelManager.getModel(me.modelName);
        me.saveButtonEnabled = model.allowUpdate();

        this.callParent(arguments);

        this.general = this.down('#general');
        this.resolution = this.down('#resolution');

        this.loadNavItems();
    },

    /**
     * Preprocess form before the built in form processing. Persist field values with not matching field name in the record. Reset values no longer applicable based on current state of the form;
     * @private
     */
    beforeSave: function () {
        return ( this.general.beforeSave() && this.resolution.beforeSave() );

    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});
