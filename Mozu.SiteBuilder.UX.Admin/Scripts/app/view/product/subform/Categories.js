/**
 * @class Taco.view.product.subform.Categories
 * @author Jimmy Sanford
 *
 */

Ext.define('Taco.view.product.subform.Categories', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.view.category.Modal', 'Taco.core.ux.form.field.MultiSelect'],

    title: 'Categories',

    initComponent: function () {
        var list, listStore;

        // categories are not global, we're only operating on the productInSiteInfo
        this.record = this.productInSiteInfo;
        

        listStore = this.record.getCategoryStore();


        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        list = Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'categoryIds',
            width: 400,
            store: listStore,
            displayField: 'name',
            valueField: 'id',
            listConfig: {
                disableSelection: true,
                itemTpl: [
                    '<span class="x-boundlist-item-content">{name}</span>',
                    '<span class="x-boundlist-item-close"> Close</span>'
                ],
                listeners: {
                    itemclick: this.onListItemClick,
                    scope: this
                }
            }
        });

        this.tools = [{
            xtype: 'secondarybutton',
            text: 'Manage Categories',
            click: this.launchModal,
            scope: this
        }];

        this.items = [list];

        this.callParent(arguments);

        // reset the list's dirty state when its store first loads
        listStore.on({
            load: function () { list.resetOriginalValue(); },
            single: true,
            scope: this
        });
    },

    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchModal: function () {
        var list = this.getForm().findField('categoryIds'),
            listStore = list.getStore(),
            treeStore = Taco.core.data.StoreManager.getCategoryTreeBySite(this.record.getId());
        

        Ext.destroy(this.modal);

        this.modal = Ext.create('Taco.view.category.Modal', {
            store: treeStore,
            preselection: listStore.getRange()
        });

        this.modal.on({
            save: this.updateList,
            scope: this
        });
    },

    /**
     * Removes a value from the list if the close icon was clicked.
     * @private
     */
    onListItemClick: function (view, record, item, index, e) {
        var closeBtn = e.getTarget('.x-boundlist-item-close', 10),
            list = view.ownerCt,
            value, store;

        if (closeBtn) {
            store = view.getStore();
            value = Ext.Array.remove(list.getValue(), record.getId());

            store.remove(record);
            list.setValue(value);
            console.log(value, list.getValue());

            return false;
        }
    },

    /**
     * Populates the list with the selected values from the modal's TreePanel.
     * @param  {Taco.core.ux.modal.Modal} modal The modal that fired the save event.
     * @param  {Object} values An object with category data for the list.
     * @private
     */
    updateList: function (modal, values) {
        var list = this.getForm().findField('categoryIds'),
            store = list.getStore();

        store.remove(store.getRange());
        store.add(values);
        list.setValue(store.collect('id'));
    }
});