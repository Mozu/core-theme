/**
 * @class Taco.view.Website.Misc.VariationModal
 */

Ext.define('Taco.view.website.misc.VariationModal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.view.website.misc.VariationGrid'
    ],
    actions: [{
        xtype: 'button',
        itemId: 'secondaryAction'
    }, {
        xtype: 'button',
        itemId: 'primaryAction',
        // this will tie this button to the validity of the form if one is assigned in the config. If the form is invalid, this action will be disabled.
        formBind: true
    }],
    autoShow: false,
    scale: 'large',
    title: 'Variations',
    closable: false,
    //title: 'Add User',
    primaryText: 'Save Rank',
    secondaryText: 'Cancel',
    primaryHandler: function () {
        var me = this;
        this.variationsGrid.rowEditor.cancelEdit();
        var variationsStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.EntityVariations');

        this.variationsGrid.view.dataSource.data.each(function (item, idx, length) {
            var props = item.get('properties');
            props.rank = length - idx;
            item.phantom = false;
            item.setDirty();

            var record = variationsStore.findRecord('id', item.get('id'));
            record.set('properties', props);
        });

        variationsStore.sync();
        this.close();
    },
    secondaryHandler: function () {
        this.variationsGrid.rowEditor.cancelEdit();
        this.close();
    },
    initComponent: function () {
        var me = this;

        me.variationsGrid = Ext.create('Taco.view.website.misc.VariationGrid', {
        });

        this.items = [me.variationsGrid];

        this.callParent(arguments);
    }
});
