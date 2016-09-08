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
    displayField: 'nameAndCode',
    valueField: 'id',
    buttonLabel: 'Add',

    initComponent: function() {
        var me = this;

        var customFilter = new Ext.util.Filter({
            filterFn: function(item) {
                var searchValue = me.list.inputEl.getValue() || '',
                    name = item.get('name'),
                    categoryCode = item.get('categoryCode'),
                    id = item.get('originalId'),
                    matchesName = name.toLowerCase().indexOf(searchValue) == 0,
                    matchesCode = categoryCode.toLowerCase().indexOf(searchValue) == 0,
                    matchesId = id.toString().indexOf(searchValue) == 0;
                return matchesName || matchesCode || matchesId;
            }
        });
        me.callParent(arguments);
        me.list.on({
            beforequery: function(queryplan) {
                var cl = this,
                    parent = cl.up();
                cl.store.clearFilter(customFilter);
                cl.store.filter(customFilter);
                return true;
            }
        });
    },

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
