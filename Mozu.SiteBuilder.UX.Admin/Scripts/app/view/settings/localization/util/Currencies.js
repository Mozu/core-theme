/** 
 * @class Taco.view.settings.localization.util.Currencies
 * @singleton
 * common localization methods 
 */
Ext.define('Taco.view.settings.localization.util.Currencies', {
    singleton:true,
   
    getSupported: function () {
        var ctx = Taco.app.context.getCurrentContext(),
            ctxType = (!ctx) ? '' : ctx.contextType,
            mc = Taco.app.context.getMasterCatalog(),
            excludeDefaultCurrency = true,
            supportedCurrencies = [];
        if (ctxType === 'm' && mc) {
            supportedCurrencies = mc.getSupportedCurrencies(excludeDefaultCurrency);
        }
        else if (ctxType === 'c') {
            var cat = Taco.app.context.getCatalog();
            if (cat) {
                supportedCurrencies.push(cat.currencyCode);
            }
        }
        return supportedCurrencies;
    },

    getQuickFilterData: function () {
        var supportedCurrencies = Taco.view.settings.localization.util.Currencies.getSupported(),
            quickFilters = [
                            [{}, 'All Records'],
                            [{ currencyExists: true }, 'Missing Currency'],
                            [{ currencyNotExists: true }, 'Has Currency']
            ];

        Ext.Array.each(supportedCurrencies, function (cur) {
            quickFilters.push([{ currencyNotExists: cur }, 'Missing ' + cur]);
            quickFilters.push([{ currencyExists: cur }, 'Has ' + cur]);
        });
        return quickFilters;
    },

    getAdvancedSearchConfig: function () {
        return {
            emptySearchText: 'Search',
            disableAdvancedSearch: true,
            quickFilterData: Taco.view.settings.localization.util.Currencies.getQuickFilterData()
        };
    }

});