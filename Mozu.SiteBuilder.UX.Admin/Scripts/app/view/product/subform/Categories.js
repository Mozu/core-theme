/**
 * @class Taco.view.product.subform.Categories
 * @author Jimmy Sanford
 *
 */

Ext.define('Taco.view.product.subform.Categories', {
    extend: 'Taco.view.product.subform.Subform',
    requires: ['Taco.view.category.Modal', 'Taco.core.ux.form.field.MultiSelect'],
   // width: '100%',
    title: 'Categories',
    flex: 1,
    layout: {
        type:'vbox',
        align:'stretch'
    },
    initComponent: function () {
        var list, listStore, me=this;

        // categories are not global, we're only operating on the productInSiteInfo
        this.record = this.productInSiteInfo;


        listStore = this.record.getUnfilteredCategoryStore();
        
        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        list = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'categoryIds',
           // width: '100%',
            store: listStore,
            flex:1,
            getStore: function () { return listStore; },
            displayField: 'name',
            valueField: 'id',
            value: this.record.get('categoryIds'),
            queryMode: 'local',
            onTriggerClick:function () {
                me.launchModal();
            }
            //listConfig: {
            //    disableSelection: true,
            //    itemTpl: [
            //        '<span class="x-boundlist-item-content">{name}</span>',
            //        '<span class="x-boundlist-item-close"> </span>'
            //    ],
            //    listeners: {
            //        itemclick: this.onListItemClick,
            //        scope: this
            //    }
            //}
        });
        this.listStore = listStore;
        list.parentThing = this;

        //this.tools = [{
        //    xtype: 'secondarybutton',
        //    text: 'Add Categories',
        //    click: this.launchModal,
        //    scope: this
        //}];
       
        this.items = [list];

        this.callParent(arguments);

        // reset the list's dirty state when its store first loads
        //listStore.on({
        //    load: function () { list.resetOriginalValue(); },
        //    single: true,
        //    scope: this
        //});
        this.mon(listStore, 'load', function () { list.resetOriginalValue(); }, this);
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
            store: treeStore
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
            value = [], store;

        if (closeBtn) {
            store = view.getStore();
            store.remove(record);
            store.each(
                function (record) {
                    value.push(record.getId());
                }
            );


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
    updateList: function (modal, newRecords) {
        var list = this.getForm().findField('categoryIds'),
            value = Ext.Array.clone(list.getValue() || []);

        //store.remove(store.getRange());
        Ext.each(newRecords, function (record) {
            if (value.indexOf(record.getId() > -1)) {
                value.push(record.getId());
            }
        });
       
        list.setValue(value);
        var bing = list.getValue();
    }
});