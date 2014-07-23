/**
 * @class Taco.store.LocalizedAttributeValues
 */
Ext.define('Taco.store.LocalizedAttributeValues', {
    extend: 'Ext.data.Store',
    model: (function () {
        return Ext.define('Taco.model.LocalizedAttributeValue' + Ext.id(), {
            extend: 'Ext.data.Model',
            fields: (function () {
                var items = [
                    {
                        name: 'attributeFQN',
                        type: 'string'
                    }, {
                        name: 'adminName',
                        type: 'string'
                    }, {
                        name: 'attributeName',
                        type: 'string'
                    }, {
                        name: 'stringValue',
                        type: 'string'
                    }, {
                        name: 'localeCode',
                        type: 'string',
                        useNull: true
                    }, {
                        name: 'supportedLocales',
                        type: 'auto',
                        defaultValue: []
                    }
                ];
                if (!Taco.app || !Taco.app.context) {
                    return items;
                }
                var mc = Taco.app.context.getMasterCatalog();
                var excludeDefaultLocale = true;
                var supportedLocales = (!mc) ? [] : mc.getSupportedLocales(excludeDefaultLocale);

                Ext.Array.each(supportedLocales, function (loc) {
                    items.push({
                        name: 'value_' + loc,
                        type: 'string',
                        useNull: true
                    });
                });
                return items;
            }()),
            proxy: {
                type: 'ajaxproxy',
                idParam: 'attributeFQN',
                api: {
                    read: '/admin/app/localizedcontent/attributevalues/read',
                    update: '/admin/app/localizedcontent/attributevalues/edit'
                },
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success'
                },
                writer: {
                    type: 'json',
                    allowSingle: true
                }
            }
        });
    }()),
    remoteFilter: true,
    remoteSort: true,
    pageSize: 50,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'm',
        clearSort: true,
        autoLoad: true
    }
});