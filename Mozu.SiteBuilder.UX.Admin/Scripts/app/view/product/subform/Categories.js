/**
 * @class Taco.view.product.subform.Categories
 * @author Jimmy Sanford
 *
 */

Ext.define('Taco.view.product.subform.Categories', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [
        'Taco.core.ux.form.field.MultiSelect'
    ],
    alias: 'widget.productcategoriessubform',

    title: 'Categories',

    flex: 1,
    layout: {
        type: 'fit'
    },

    initComponent: function () {
        var me = this,
            list,
            listStore;

        // categories are not global, we're only operating on the productInCatalogInfo
        this.record = this.productInCatalogInfo;


        listStore = this.record.getUnfilteredCategoryStore();

        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        list = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'categoryIds',
            store: listStore,
            flex: 1,
            getStore: function () {
                return listStore;
            },
            displayField: 'name',
            valueField: 'id',
            value: this.record.get('categoryIds'),
            queryMode: 'local',
            enableKeyEvents: true
        });

        this.listStore = listStore;
        list.parentThing = this;

        this.items = [list];

        this.callParent(arguments);

        this.mon(listStore, 'load', function () {
            list.resetOriginalValue();
        }, this);
    },

    /**
     * Removes a value from the list if the close icon was clicked.
     * @private
     */
    onListItemClick: function (view, record, item, index, e) {
        var closeBtn = e.getTarget('.x-boundlist-item-close', 10),
            list = view.ownerCt,
            value = [],
            store;

        if (closeBtn) {
            store = view.getStore();
            store.remove(record);
            store.each(
                function (record) {
                    value.push(record.getId());
                }
            );


            list.setValue(value);

            return false;
        }
    },

    /**
     * Populates the list with the selected values from the modal's TreePanel.
     * @param  modal The modal that fired the save event.
     * @param  {Object} values An object with category data for the list.
     * @private
     */
    updateList: function (modal, newRecords) {
        var list = this.getForm().findField('categoryIds'),
            value = Ext.Array.clone(list.getValue() || []);

        Ext.each(newRecords, function (record) {
            if (value.indexOf(record.getId() > -1)) {
                value.push(record.getId());
            }
        });

        list.setValue(value);
        var bing = list.getValue();
    }
});