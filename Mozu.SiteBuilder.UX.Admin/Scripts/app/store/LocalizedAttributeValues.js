/**
 * @class Taco.store.LocalizedAttributeValues
 */
Ext.define('Taco.store.LocalizedAttributeValues', {
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
            ],
            idParam: 'attributeFQN',
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
        this.model = Ext.define('Taco.model.LocalizedAttributeValue' + Ext.id(), modelCfg);

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