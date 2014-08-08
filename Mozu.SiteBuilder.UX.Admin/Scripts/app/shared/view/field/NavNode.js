/**
 * @class Taco.shared.view.field.Category
 */

Ext.define('Taco.shared.view.field.Category', {
    extend: 'Ext.container.Container',
    layout: 'auto',
    requires: [
        'Taco.view.category.Modal',
        'Taco.store.Categories'
    ],

    initComponent: function() {
        var catStore = this.getCategoryStore();
        // reset the list's dirty state when its store first loads

        catStore.on({
            load: function() {
                this.categoryList.resetOriginalValue();
            },
            single: true,
            scope: this
        });
        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        this.categoryList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: this.name,
            width: this.width || 290,
            multiSelect: this.multiSelect,
            margin: 0,
            store: catStore,
            getStore: function() {
                return catStore;
            },
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            displayField: 'name',
            valueField: 'id',
            fieldLabel: this.fieldLabel || 'Select Categories',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            }
        });

        this.items = [
             this.categoryList,
                {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Add',
                    margin: '0 0 0 10',
                    width: 70,
                    style: {
                        verticalAlign: 'bottom'
                    },
                    handler: this.launchCategoryModal,
                    scope: this
                }
        ]

        this.callParent(arguments);
    },

    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchCategoryModal: function() {
        var treeStore = Taco.core.data.StoreManager.getCategoryTreeByCatalog(),
            list = this.categoryList;

        this.modal = Ext.create('Taco.view.category.Modal', {
            store: treeStore
        });

        this.modal.on({
            savesuccess: function(modal, values) {
                list.addValue(values);
            },
            scope: this
        });
    },

    getCategoryStore: function() {
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

    }
});
