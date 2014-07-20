/**
 * @class Taco.store.LocalizedProductProperties
 */
Ext.define('Taco.store.LocalizedProductProperties', {
    extend: 'Ext.data.Store',
    model: function () {
        return Ext.define('Taco.model.LocalizedProductProperty' + Ext.id(), {
            extend: 'Ext.data.Model',
            fields: function () {
                var items = [
                    {
                        name: 'attributeFQN',
                        type: 'string'
                    }, {
                        name: 'adminName',
                        type: 'string'
                    }, {
                        name: 'attributeValue',
                        type: 'string'
                    }, {
                        name: 'stringValue',
                        type: 'string'
                    }, {
                        name: 'productCode',
                        type: 'string',
                        useNull: true
                    }, {
                        name: 'productName',
                        type: 'string',
                        useNull: true
                    }, {
                        name: 'locale',
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
            }(),
            proxy: {
                type: 'ajaxproxy',
                idParam: 'attributeFQN',
                api: {
                    read: '/admin/app/localizedcontent/productproperties/read',
                    update: '/admin/app/localizedcontent/productproperties/edit'
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
    }(),
    remoteFilter: true,
    remoteSort: true,
    pageSize: 50,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'mc',
        clearSort: true,
        autoLoad: true
    }
});