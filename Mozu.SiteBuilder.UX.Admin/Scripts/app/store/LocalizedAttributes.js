/**
 * @class Taco.store.LocalizedAttributes
 */
Ext.define('Taco.store.LocalizedAttributes', {
    extend: 'Ext.data.Store',


    constructor: function(config) {
        var modelCfg = {
            extend: 'Taco.core.data.Model',
            fields: [
                {
                    name: 'attributeFQN',
                    type: 'string'
                }, {
                    name: 'adminName',
                    type: 'string'
                }, {
                    name: 'name',
                    type: 'string'
                }, {
                    name: 'description',
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

                api: {
                    read: '/admin/app/localizedcontent/attributes/read',
                    update: '/admin/app/localizedcontent/attributes/edit'
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
                    name: 'name_' + loc,
                    type: 'string',
                    useNull: true
                });
            })
        }

        this.model = Ext.define('Taco.model.LocalizedAttribute' + Ext.id(), modelCfg);

        

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