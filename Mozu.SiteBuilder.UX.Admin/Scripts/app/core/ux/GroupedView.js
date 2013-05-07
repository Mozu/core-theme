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
            len = records.length,
            record;

        for (; i < len; i++) {
            record = records[i];
            data[i] = this.prepareData(record.data, startIndex + i, record);
        }

        data.groups = this.getStore().getGroups();

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