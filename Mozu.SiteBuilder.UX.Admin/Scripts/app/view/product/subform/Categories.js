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
            queryMode: 'local',
            lastQuery: '',
            triggerOnClick: false,
            forceSelection: true,
            typeAhead: true,
            displayField: 'nameAndCodeAndStatus',
            value: this.record.get('categoryIds'),
            valueField: 'id',
            style: {
                display: 'inline-table',
                verticalAlign: 'bottom'
            },
            listeners: {
                beforequery: function(queryPlan) {
                    list.store.clearFilter(list.customFilter);
                    list.store.filter(list.customFilter);
                    return true;
                }
            },
            customFilter: new Ext.util.Filter({
                filterFn: function(item) {
                    var searchValue = list.inputEl.getValue() || '';
                    searchValue = searchValue.toLowerCase();
                    var name = item.get('name'),
                        categoryCode = item.get('categoryCode'),
                        id = item.get('id'),
                        matchesName = name.toLowerCase().indexOf(searchValue) == 0,
                        matchesCode = categoryCode.toLowerCase().indexOf(searchValue) == 0,
                        matchesId = id.toString().indexOf(searchValue) == 0;

                    return matchesName || matchesCode || matchesId;
                }
            })
        });

        this.listStore = listStore;
        list.parentThing = this;

        this.items = [list];

        this.callParent(arguments);

        this.mon(listStore, 'load', function () {
            me.listStore.addFilter({
                property: 'categoryType',
                value: 'Static'
            });
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