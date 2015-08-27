/**
 * @class Taco.core.ux.CountrySelector
 */

/*

// deprecated;



Ext.define('Taco.core.ux.CountrySelector', {
    extend: 'Taco.core.ux.TreeList',
    alias: 'widget.countryselector',
    requires: [
        'Taco.store.CountryComboBox'

    ],
    flex: 1,

    initComponent: function () {
        var me = this;

        me.store = Ext.create('Taco.store.CountryComboBox'),
        me.columns = [{
            xtype: 'treecolumn',
            text: 'Name',
            flex: 1,
            dataIndex: 'name'
        }]

        me.callParent(arguments);
        me.on({
            load: me.initChecked,
            scope: this,
            single: true
        });
    },
    initChecked: function () {
        var me = this;

        if (me.showCheckBoxes) {
            Ext.Object.each(me.store.tree.nodeHash, function (idx, item) { item.set('checked', false); });
        }
        if (me.selected) {
            Ext.Array.each(me.selected, function (id) {
                var model = me.store.getNodeById(id);
                if (model) {
                    model.set('checked', true);
                    while (model.parentNode != null && !model.parentNode.expanded) {
                        model.parentNode.expand();
                        model = model.parentNode;
                    }

                }
            });
        }
    }
});*/