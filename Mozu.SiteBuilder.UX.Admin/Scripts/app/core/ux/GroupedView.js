/**
 * @class Taco.core.ux.GroupedView
 */

Ext.define('Taco.core.ux.GroupedView', {
    extend: 'Ext.view.View',

    baseCls: Taco.baseCSSPrefix + 'grouped-view',

    initComponent: function () {
        this.callParent(arguments);
    },

    collectData: function (records, startIndex) {
        var data = [],
            i = 0,
            groupField = this.getStore().groupField,
            groupDir = this.getStore().groupDir,
            grouper= this.getStore().groupers.getAt(0),
            len = records.length,
            record;

        for (; i < len; i++) {
            record = records[i];
            data[i] = this.prepareData(record.data, startIndex + i, record);
        }

        
        data.groups = this.getStore().getGroups();
        data.groups.sort(function (a, b) {

            var aVal = a.children[0].get(groupField),
                bVal = b.children[0].get(groupField),
                ret;
            ret = 0;
            if (aVal == bVal) {
                ret = 0;
            } else if (aVal < bVal) {
                ret = 1;
            } else {
                ret = -1;
            }
              
            if (grouper.direction == "ASC") {
                ret = ret * -1;
            }
            return ret;

        });
        return data;
    },

    onAdd: function (ds, records, index) {
        var me = this,
            nodes;

        if (me.rendered) {
            me.refresh();
            nodes = me.all.elements.slice();

            if (me.hasListeners.itemadd) {
                me.fireEvent('itemadd', records, index, nodes);
            }
        }
    }
});