/**
 * @class Taco.store.LocalizedProductExtras
 */

Ext.define('Taco.store.LocalizedProductExtras', {
    extend: 'Ext.data.Store',
    model: function () {
        return Ext.define('Taco.model.LocalizedProductVariants' + Ext.id(), {
            extend: 'Ext.data.Model',
            fields: function () {
                var items = [
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
                ];
                if (!Taco.app || !Taco.app.context) {
                    return items;
                }
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
                }
                else if (ctxType === 'c') {
                    cat = Taco.app.context.getCatalog();
                    if (cat) {
                        supportedCurrencies.push(cat.currencyCode);
                    }
                }

                Ext.Array.each(supportedCurrencies, function (cur) {
                    items.push({
                        name: 'price_' + cur,
                        type: 'float',
                        useNull: true
                    });
                });
                return items;
            }(),
            //validations: [{
            //    type: 'length',
            //    name: 'name',
            //    min: 3,
            //    max: 100
            //}, {
            //    type: 'presence',
            //    name: 'name'
            //}, {
            //    type: 'length',
            //    name: 'adminName',
            //    min: 3,
            //    max: 100
            //}, {
            //    type: 'presence',
            //    name: 'adminName'
            //}
            //],
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