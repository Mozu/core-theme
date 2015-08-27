/**
 * @class Taco.store.LocalizedProductVariants
 */
Ext.define('Taco.store.LocalizedProductVariants', {
    extend: 'Ext.data.Store',
    constructor: function (config) {

        var modelCfg = {
            extend: 'Ext.data.Model',
            fields: [
                {
                    name: 'variantProductCode',
                    type: 'string'
                }, {
                    name: 'variationKey',
                    type: 'string'
                }, {
                    name: 'parentProductCode',
                    type: 'string'
                }, {
                    name: 'productName',
                    type: 'string'
                }, {
                    name: 'options',
                    type: 'auto',
                    defaultValue: []
                }, {
                    name: 'currencyCode',
                    type: 'string'
                }, {
                    name: 'deltaPrice',
                    type: 'float',
                    useNull: true
                }, {
                    name: 'deltaCreditValue',
                    type: 'float',
                    useNull: true
                }, {
                    name: 'deltaMSRP',
                    type: 'float',
                    useNull: true
                }, {
                    name: 'supportedCurrencies',
                    type: 'auto',
                    defaultValue: []
                }
            ],
            idParam: 'variantProductCode',
            proxy: {
                type: 'ajaxproxy',
                idParam: 'variantProductCode',
                api: {
                    read: '/admin/app/localizedcontent/productvariants/read',
                    update: '/admin/app/localizedcontent/productvariants/edit'
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
                modelCfg.fields.push({
                    name: 'msrp_' + cur,
                    type: 'float',
                    useNull: true
                });
                modelCfg.fields.push({
                    name: 'credit_' + cur,
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