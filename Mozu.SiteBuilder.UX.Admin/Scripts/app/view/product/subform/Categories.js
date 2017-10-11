/**
 * @class Taco.view.product.subform.Categories
 * @author Jimmy Sanford
 *
 */

Ext.define('Taco.view.product.subform.Categories', {
    extend: 'Taco.view.product.subform.Subform',
    requires: [
        'Taco.core.ux.form.field.MultiSelect',
        'Taco.model.Category'
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
        this.list = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'categoryIds',
            grow: false,
            growToLongestValue: false,
            store: listStore,
            flex: 1,
            getStore: function () {
                return listStore;
            },
            displayField: 'nameAndCodeAndStatus',
            fieldLabel: 'Assigned Categories',
            hoverField: 'fullPath',
            itemId: 'assignedCategory',
            valueField: 'id',
            lastQuery: "",
            value: this.record.get('categoryIds'),
            queryMode: 'local',
            enableKeyEvents: true,
            listeners: {
                change: this.updatePrimaryCategory,
                scope: this
            }
        });

        this.selectedCategoryStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.Category',
            data: []
        });

        this.primaryCategory = Ext.widget({
            xtype: 'combobox',
            fieldLabel: 'Primary Category',
            name: 'primaryCategoryId',
            allowBlank: true,
            grow: false,
            growToLongestValue: false,
            itemId: 'primaryCategory',
            valueField: 'id',
            displayField: 'nameAndCodeAndStatus',
            store: this.selectedCategoryStore,
            queryMode: 'local',
            enableKeyEvents: true,
            listeners: {
                change: function(category, categoryId) {
                    this.record.set('primaryCategoryId', categoryId);
                },
                scope: this
            },
            tooltop: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'primaryCategory',
                hoverTarget: 'label',
                messageKey: 'product.categories.primaryCategory',
                offsetLeft: 43,
                offsetTop: 70
            })
        });

        this.listStore = listStore;

        this.items = [
            {
                layout: 'hbox',
                items: [
                    this.list,
                    {
                        xtype: 'button',
                        scale: 'medium',
                        ui: 'action',
                        text: 'Add',
                        margin: '34 0 0 10',
                        width: 70,
                        style: {
                            verticalAlign: 'bottom'
                        },
                        handler: function() {
                            this.launchCategoryModal(me.list)
                        },
                        scope: this
                    }
                ]
            },
            this.primaryCategory
        ];

        this.callParent(arguments);

        this.mon(listStore, 'load', function () {
            this.listStore.addFilter({
                property: 'categoryType',
                value: 'Static'
            });
            this.list.resetOriginalValue();
        }, this);

        listStore.whenLoaded(this.updatePrimaryCategory, this);
    },

    updatePrimaryCategory: function () {
        if (this.rendered && this.value && this.value.length > 1) {
            this.grow = true;
        }
        if (!this.listStore || this.listStore.isLoading()) {
            return;
        }
        
        this.selectedCategoryStore.removeAll();

        var assignedCategoryIds = this.list.getValue() || [];

        if (!assignedCategoryIds.length) {
            this.primaryCategory.setValue(null);
            this.primaryCategory.setDisabled(true);
            this.record.set('primaryCategoryId', null);
            return;
        }

        this.primaryCategory.setDisabled(false);

        var possibleCategories = this.listStore.data.items.filter(function (record) {
            return assignedCategoryIds.indexOf(record.getId()) > -1;
        });

        var primaryCategoryId = this.primaryCategory.getValue();

        if (assignedCategoryIds.indexOf(primaryCategoryId) === -1) {
            this.primaryCategory.setValue(null);
            primaryCategoryId = null;
            this.record.set('primaryCategoryId', null);
        }

        this.selectedCategoryStore.add(possibleCategories);
        this.primaryCategory.setValue(primaryCategoryId);
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
    },

    launchCategoryModal: function (list) {
        var treeStore = Taco.core.data.StoreManager.getCategoryTreeByCatalog(
            this.record.get('catalogId')
        );


        this.mon(treeStore, {
            load: function () {
                treeStore.filterBy(function (record) {
                    return record.get("categoryType") === "Static";
                });
            },
            beforeexpand: function (node, opts) {
                node.childNodes = node.childNodes.filter(function (childNode) {
                    return childNode.data.categoryType === "Static";
                });
            },
            scope: this
        });

        this.modal = Ext.create('Taco.view.category.Modal', {
            store: treeStore
        });

        this.modal.on({
            savesuccess: function (modal, values) {
                list.addValue(values);
            },
            scope: this
        });
    }
});