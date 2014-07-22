/** 
 * @class Taco.view.settings.localization.util.Currencies
 * @singleton
 * common localization methods 
 * 
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
        // need to 
        var supportedCurrencies = Taco.view.settings.localization.util.Currencies.getSupportedCurrencies(),
            quickFilters = [
                            [{ hasRecord: false }, 'Missing Currency'],
                            [{ hasRecord: true }, 'Has Currency'],
                            [{}, 'All Records']
            ];

        Ext.Array.each(supportedCurrencies, function (cur) {
            quickFilters.push([{ localeNotExists: cur }, 'Missing ' + cur]);
            quickFilters.push([{ localeExists: cur }, 'Has ' + cur]);
        });
        return quickFilters;
    }

});