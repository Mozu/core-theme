/** 
 * @class Taco.view.settings.localization.util.Locales
 * @singleton
 * common localization methods
 */
Ext.define('Taco.view.settings.localization.util.Locales', {
    singleton:true,
   
    getSupported: function () {
        var ctx = Taco.app.context.getCurrentContext(),
            ctxType = (!ctx) ? '' : ctx.contextType,
            mc = Taco.app.context.getMasterCatalog(),
            excludeDefaultLocale = true,
            supportedLocales = [];
        if (ctxType === 'm' && mc) {
            supportedLocales = mc.getSupportedLocales(excludeDefaultLocale);
        }
        else if (ctxType === 'c') {
            var cat = Taco.app.context.getCatalog();
            if (cat) {
                supportedLocales.push(cat.localeCode);
            }
        }
        return supportedLocales;
    },

    getQuickFilterData: function () {
        // need to 
        var supportedLocales = Taco.view.settings.localization.util.Locales.getSupported(),
              quickFilters = [
                              [{}, 'All Records'],
                              [{ exists: false }, 'Missing Translation'],
                              [{ exists: true }, 'Has Translation']
              ];

        Ext.Array.each(supportedLocales, function (loc) {
            quickFilters.push([{ localeNotExists: loc }, 'Missing ' + loc]);
            quickFilters.push([{ localeExists: loc }, 'Has ' + loc]);
        });
        return quickFilters;
    },

    getAdvancedSearchFilterData: function () {
        // need to 
        var supportedLocales = Taco.view.settings.localization.util.Locales.getSupported(),
              quickFilters = [{ id: { exists: false }, name: 'Missing Translation' },
                  { id: { exists: true }, name: 'Has Translation' }
                              //[{ hasRecord: false }, 'Missing Translation'],
                              //[{ hasRecord: true }, 'Has Translation'],
                              //[{}, 'All Records']
              ];

        //Ext.Array.each(supportedLocales, function (loc) {
        //    quickFilters.push([{ localeNotExists: loc }, 'Missing ' + loc]);
        //    quickFilters.push([{ localeExists: loc }, 'Has ' + loc]);
        //});
        return quickFilters;
    },

    getAdvancedSearchConfig: function () {
        return {
            emptySearchText: 'Search',
            disableAdvancedSearch: true,
            quickFilterData: Taco.view.settings.localization.util.Locales.getQuickFilterData()
        };
    }
});