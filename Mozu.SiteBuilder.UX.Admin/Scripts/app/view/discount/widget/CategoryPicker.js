/**
 * @class  Taco.view.discount.CategoryPicker
 * @author gm
 * @description Discount Category Picker
 */
Ext.define('Taco.view.discount.widget.CategoryPicker', {
    extend: 'Ext.form.Panel',
    alias: 'widget.categorypicker',
    layout: 'hbox',
    catStore: null,
    record: null,
    name: 'categories',
    listWidth: 382,
    height: 30,

    initComponent: function () {
        var me = this;
        this.catStore.clearFilter(true);
        this.catStore.load();

        // reset the list's dirty state when its store first loads
        this.catStore.on({
            load: function() {
                me.categoryList.resetOriginalValue();
            },
            single: true,
            scope: this
        });

        this.addEvents(
            /**
            * @event
            * Triggered when the category changes
            * @param event
            */
            'change'
        );

        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        this.categoryList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'categoriesList',
            width: this.listWidth,
            margin: 0,
            store: this.catStore,
            getStore: function () {
                return this.catStore;
            },
            queryMode: 'local',
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            displayField: 'nameAndCode',
            value: this.record.get(this.name),
            valueField: 'id',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            }
            ,
            listeners: {
                change: function (myself, newValue) {
                    this.fireEvent('change', { categories: newValue });
                },
                scope: this
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
                handler: function() {
                    this.launchCategoryModal(me.categoryList);
                },
                scope: this
            }
        ];

        this.callParent(arguments);

    },

    getValue: function() {
        return this.categoryList.getValue();
    },

    setValue: function(newVal) {
        this.categoryList.setValue(newVal);
    },
    
    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchCategoryModal: function (list) {
        var me = this,
            treeStore = Taco.core.data.StoreManager.getCategoryTreeByCatalog();

        this.modal = Ext.create('Taco.view.category.Modal', {
            store: treeStore
        });

        this.modal.on({
            savesuccess: function (modal, values) {
                list.addValue(values);
                me.reloadStore(list);
            },
            aftercancelclose: function () {
                me.reloadStore(list);
            },
            scope: this
        });
    },    

    reloadStore: function (list) {
        var store = list.store,
            proxy = store.getProxy();
        if (proxy.extraParams) {
            proxy.extraParams = {};
        }
        store.load();
    },

    /**
     * Removes a value from the list if the close icon was clicked.
     * @private
     */
    onCategoryListItemClick: function (view, record, item, index, e) {
        var closeBtn = e.getTarget('.x-boundlist-item-close', 10),
            list = view.ownerCt,
            value, store;
        if (closeBtn) {
            store = view.getStore();
            value = Ext.Array.remove(list.getValue(), record.getId());
            store.remove(record);
            list.setValue(value);
            return false;
        }
    },

    setCategoryListValue: function(val) {
        this.categoryList.setValue(val);
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});