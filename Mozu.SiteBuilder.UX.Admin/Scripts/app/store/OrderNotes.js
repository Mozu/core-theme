/**
* @class Taco.store.OrderNotes
* @author Jimmy Sanford
* The OrderNotes store
*/

    Ext.define('Taco.store.OrderNotes', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.OrderNote',
        pageSize: 25,
        remoteSort: false,
        remoteFilter: false,

        autoLoad: false,
        autoSync: true,

        sorters: [{
            property: 'createDate',
            direction: 'DESC'
        }],
        groupers: [{
            property: 'createDate',
            direction: 'DESC'
        }],

        /**
         * overrides Ext.util.Grouper#getGroupString
         * We want to group on createDate, but not before calling Ext.Date.clearTime() on it.
         */
        getGroupString: function (record) {
            var group = this.groupers.first();

            if (group) {
                var prop = record.get(group.property);
                if (prop && Ext.isDate(prop))
                    return Ext.Date.clearTime(prop, true);
                if (prop)
                    return prop;
            }
            return '';
        }
    });