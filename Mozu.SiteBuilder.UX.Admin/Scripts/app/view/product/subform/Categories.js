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

        this.record = this.productInSiteInfo;

        this.store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.CategoriesTree',
            autoLoad: true
        });

        listStore = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: []
        });

        list = Ext.create('Taco.core.ux.form.field.MultiSelect', {
            name: 'categoryIds',
            store: listStore,
            displayField: 'name',
            valueField: 'id',
            listConfig: {
                disableSelection: true
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

        if (this.store.loading) {
            this.store.on({
                load: this.onLoad,
                scope: this
            });
        } else {
            this.onLoad();
        }
    },

    launchModal: function () {
        Ext.destroy(this.modal);

        this.modal = Ext.create('Taco.view.category.Modal', {
            store: this.store
        });

        this.modal.on({
            save: this.updateList,
            scope: this
        });
    },

    onLoad: function () {
        var pis = this.product.productInSitesStore().first(),
            values;

        values = Ext.Array.map(Ext.Array.clone(pis.get('categoryIds')), function (categoryId) {
            var record = this.store.getById(categoryId);

            return { id: categoryId, name: record.get('name') };
        }, this);
    },

    updateList: function (modal, values) {
        var list = this.getForm().findField('categoryIds');

        list.getStore().loadData(values, false);
        list.setValue(Ext.Array.pluck(values, 'id'));
        console.log(list.getValue(), list.getSubmitValue());
    }
});