/**
 * @class Taco.store.LocalizedProductExtras
 */
Ext.define('Taco.store.LocalizedProductExtras', {
    extend: 'Ext.data.Store',
    constructor: function (config) {

        var modelCfg = {
            extend: 'Ext.data.Model',
            fields: [
                {
                    name: 'productCode',
                    type: 'string'
                }, {
                    name: 'productName',
                    type: 'string'
                }, {
                    name: 'attributeFQN',
                    type: 'string'
                }, {
                    name: 'adminName',
                    type: 'string'
                }, {
                    name: 'attributeName',
                    type: 'string'
                }, {
                    name: 'currencyCode',
                    type: 'string'
                }, {
                    name: 'deltaPrice',
                    type: 'float',
                    useNull: true
                }, {
                    name: 'supportedCurrencies',
                    type: 'auto',
                    defaultValue: []
                }
            ],
            idParam: 'productCode',
            proxy: {
                type: 'ajaxproxy',
                idParam: 'productCode',
                api: {
                    read: '/admin/app/localizedcontent/productextras/read',
                    update: '/admin/app/localizedcontent/productextras/edit'
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

            var ctx = Taco.app.context.getCurrentContext(),
                ctxType = (!ctx) ? '' : ctx.contextType,
                supportedCurrencies = [],
                excludeDefaultCurrency = true,
                mc,
                cat;

            if (ctxType === 'm') {
                mc = Taco.app.context.getMasterCatalog();
                if (mc) {
                    supportedCurrencies = mc.getSupportedCurrencies(excludeDefaultCurrency);
                }
            } else if (ctxType === 'c') {
                cat = Taco.app.context.getCatalog();
                if (cat) {
                    supportedCurrencies.push(cat.currencyCode);
                }
            }

            Ext.Array.each(supportedCurrencies, function (cur) {
                modelCfg.fields.push({
                    name: 'price_' + cur,
                    type: 'float',
                    useNull: true
                });
            });
        }


        this.model = Ext.define('Taco.model.LocalizedProductVariants' + Ext.id(), modelCfg);
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