/**
 * @class Taco.shared.view.field.Category
 */

Ext.define('Taco.shared.view.field.Category', {
    extend: 'Taco.shared.view.field.BoxSelectWithModal',
    requires: [
        'Taco.view.category.Modal',
        'Taco.store.Categories'
    ],

    fieldLabel: 'Select Categories',
    displayField: 'name',
    valueField: 'id',
    buttonLabel: 'Add',
    
    getSelectStore: function() {
        var me = this;
        if (!me.categoryStore) {
            me.categoryStore = Taco.core.data.StoreManager.getOrCreate(
                {
                    type: 'Taco.store.Categories',
                    createOnly: true,
                    id: "cat-" + this.id,
                    autoLoad: true,
                    clearFilters: false,
                    remoteFilter: false
                });

        }
        return me.categoryStore;

    },

    getModal: function() {
        return Ext.create('Taco.view.category.Modal', {
            multiSelect: this.multiSelect,
            store: Taco.core.data.StoreManager.getCategoryTreeByCatalog()
        });
    }
    
});
