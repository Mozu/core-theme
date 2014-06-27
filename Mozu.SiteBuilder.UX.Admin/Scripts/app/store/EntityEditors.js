/**
 * @class Taco.store.Roles
 */


Ext.define('Taco.store.EntityEditors', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.EntityEditor',
        storeManagerConfig: {
            clearFilters: false,
            contextLevel: 't,c,mc,m,s',
            clearSort: false,
            autoLoad: true
        },
        findEditor: function (entityRecord) {
            var ret = this.data.filterBy(function (item) {
                var isMatch = false;
                if (entityRecord.get('entityType') == 'cms') {
                    isMatch = isMatch || Ext.Array.findBy((item.raw.documentTypes || []), function (crit) {
                        return crit && entityRecord.raw.documentType && crit.toLowerCase() == entityRecord.raw.documentType.toLowerCase();
                    });
                    isMatch = isMatch || Ext.Array.findBy((item.raw.documentLists || []), function (crit) {
                        return crit && entityRecord.raw.documentListName && crit.toLowerCase() == entityRecord.raw.documentListName.toLowerCase();
                    });
                }
                if (entityRecord.get('entityType') == 'mzdb') {
                    isMatch = isMatch || Ext.Array.findBy((item.raw.entityLists || []), function (crit) {

                        return crit && entityRecord.get('entityListFullName') && crit.toLowerCase() == entityRecord.get('entityListFullName').toLowerCase();
                    });
                }
                return isMatch;

            });
            if (ret.getCount()) {
                ret.sortBy(function (a, b) {
                    return b.get('priority') - a.get('priority');
                });
                return ret.getAt(0);
            }
            return this.getById('default');
        }
    }
);
