/**
 * @class Taco.shared.view.field.NavNode
 */

Ext.define('Taco.shared.view.field.NavNode', {
    extend: 'Taco.shared.view.field.BoxSelectWithModal',
    requires: [
        'Taco.view.website.NavigationTreeModal',
        'Taco.store.NavigationFlattened'
    ],

    fieldLabel: 'Select Navigation Node',
    displayField: 'name',
    valueField: 'id',
    buttonLabel: 'Add',

    getSelectStore: function() {
        var me = this;
        if (!me.categoryStore) {
            me.categoryStore = Taco.core.data.StoreManager.getOrCreate(
                {
                    type: 'Taco.store.NavigationFlattened',
                    createOnly: true,
                    id: "nav-" + this.id,
                    autoLoad: true,
                    clearFilters: false,
                    remoteFilter: false
                });

        }
        return me.categoryStore;

    },

    getModal: function() {
        return Ext.create('Taco.view.website.NavigationTreeModal', {
            store: Taco.core.data.StoreManager.getOrCreate('Taco.store.NavigationTreeNodes')
        });
    }

});
