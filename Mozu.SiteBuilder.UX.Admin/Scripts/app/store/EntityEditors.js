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

        constructor: function () {
            if (Taco.app.context.getCurrent().contextType == 's') {
                this.pageTypeDefinitions = Taco.core.data.StoreManager.getOrCreate('Taco.store.PageTypeDefinitions');
            }
            this.callParent(arguments);
        },

    //
        
        findEditor: function (entityRecord) {

            var ret;
            if (entityRecord.get('entityType') == 'cms' && this.pageTypeDefinitions && entityRecord.data && entityRecord.data.properties && entityRecord.data.properties.page_type_definition) {
                ret = this.pageTypeDefinitions.getById( entityRecord.data.properties.page_type_definition);
                if (ret ) {
                    ret = this.getById('theme_' + ret.data.customEditor);
                } 
            }
            if (ret) {
                return ret;
            }

            ret = this.data.filterBy(function (item) {
                var isMatch = false;


                if (entityRecord.get('entityType') == 'cms') {
                    isMatch = isMatch || Ext.Array.findBy((item.data.documentTypes || []), function (crit) {
                        return crit && entityRecord.data.documentType && crit.toLowerCase() == entityRecord.data.documentType.toLowerCase();
                    });
                    isMatch = isMatch || Ext.Array.findBy((item.data.documentLists || []), function (crit) {
                        return crit && entityRecord.data.documentListName && crit.toLowerCase() == entityRecord.data.documentListName.toLowerCase();
                    });
                }
                if (entityRecord.get('entityType') == 'mzdb') {
                    isMatch = isMatch || Ext.Array.findBy((item.data.entityLists || []), function (crit) {

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
