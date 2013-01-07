/**
 * @class Taco.core.ux.form.Linker
 * ??ORPHAN??
 */

Ext.define('Taco.core.ux.form.Linker', {
    extend: 'Taco.core.ux.content.Container',
    alias: 'widget.linker',
    requires: ['Taco.core.ux.FilterableDataView', 'Taco.core.ux.TabPanel'],


    bubbleEvents: ['save', 'cancel'],

    body: {
        layout: 'fit',
        items: [{
            xtype: 'tacotabpanel',
            fullHeight: true,
            items: [{
                title: "Remove",
                itemid: "linked",
                layout: 'fit',
                items: []
            }, {
                title: "Add",
                itemid: "unlinked",
                layout: 'fit',
                items: []
            }]
        }]
    },

    initComponent: function () {
        var me = this;

        me.header = {
            title: 'Link ' + Ext.String.capitalize(this.type),
            actions: [{
                xtype: 'primarybutton',
                text: 'Save',
                onClick: function () {
                    me.commit();
                }
            }, {
                xtype: 'secondarybutton',
                text: 'Cancel',
                onClick: function () {
                    me.fireEvent('cancel');
                }
            }]
        };

        if (me.linkedStore.count() === 0) {
            me.body.items[0].activeIndex = 1;
        }

        this.callParent(arguments);

        var tabPanel = this.body.items.get(0);

        this.deselector = Ext.create('Taco.core.ux.FilterableDataView', {
            columns: me.columns,
            sorters: me.sorters,
            store: me.linkedStore,
            searchParam: me.searchParam,
            type: this.type,
            parentModel: this.parentModel,
            selectionMode: 'deselection'
        });

        this.selector = Ext.create('Taco.core.ux.FilterableDataView', {
            columns: me.columns,
            sorters: me.sorters,
            store: me.unlinkedStore,
            searchParam: me.searchParam,
            type: this.type,
            parentModel: this.parentModel,
            selectionMode: 'selection'
        });

        tabPanel.addToTab(0, this.deselector);

        tabPanel.addToTab(1, this.selector);
    },



    commit: function () {
        var me = this,
            thisId = me.parentModel.get('id'),
            selectorUpdates, deselectorUpdates;

        Ext.Array.forEach(me.deselector.getSelectedItems(), function (item) {
            var assocIds = item.get(me.filterProperty) || [];
            item.set(me.filterProperty, Ext.Array.remove([].concat(assocIds), thisId));
        });

        Ext.Array.forEach(me.selector.getSelectedItems(), function (item) {
            var assocIds = item.get(me.filterProperty) || [];
            item.set(me.filterProperty, [thisId].concat(assocIds));
        });

        selectorUpdates = me.selector.store.getUpdatedRecords();
        deselectorUpdates = me.deselector.store.getUpdatedRecords();

        if (selectorUpdates.length === 0 && deselectorUpdates.length === 0) {
            me.fireEvent('save');
            return true;
        }

        me.linkedStore.add(selectorUpdates);
        me.linkedStore.sync({
            callback: function () {
                me.fireEvent('save');
            }
        });

    }
});