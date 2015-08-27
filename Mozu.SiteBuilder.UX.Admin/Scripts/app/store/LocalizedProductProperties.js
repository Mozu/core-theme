/**
 * @class Taco.store.LocalizedProductProperties
 */
Ext.define('Taco.store.LocalizedProductProperties', {
    extend: 'Ext.data.Store',
    constructor: function (config) {

        var modelCfg = {
            extend: 'Ext.data.Model',
            fields: [
                {
                    name: 'attributeFQN',
                    type: 'string'
                }, {
                    name: 'adminName',
                    type: 'string'
                }, {
                    name: 'canonicalValue',
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
                    name: 'localeCode',
                    type: 'string',
                    useNull: true
                }, {
                    name: 'supportedLocales',
                    type: 'auto',
                    defaultValue: []
                }
            ],
            idParam: 'attributeFQN',
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
        };

       

        if (Taco.app && Taco.app.context) {

            var mc = Taco.app.context.getMasterCatalog();
            var excludeDefaultLocale = true;
            var supportedLocales = (!mc) ? [] : mc.getSupportedLocales(excludeDefaultLocale);

            Ext.Array.each(supportedLocales, function (loc) {
                modelCfg.fields.push({
                    name: 'value_' + loc,
                    type: 'string',
                    useNull: true
                });
            });
    
        }
        this.model = Ext.define('Taco.model.LocalizedProductProperty' + Ext.id(), modelCfg);

        return this.callParent(arguments);

    },
    remoteFilter: true,
    remoteSort: true,
    pageSize: 50,
    storeManagerConfig: {
        createOnly: true,
        autoLoad: true
    }
});