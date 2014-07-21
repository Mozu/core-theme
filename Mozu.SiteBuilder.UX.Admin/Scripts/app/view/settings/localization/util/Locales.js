///** 
// * @class Taco.view.settings.localization.util.LocaleUtil
// * common localization methods 
// * 
// */
//Ext.define('Taco.view.settings.localization.util.LocaleUtil', {
//    singleton:true,
   
//    getSupported: function () {
//        var ctx = Taco.app.context.getCurrentContext(),
//            ctxType = (!ctx) ? '' : ctx.contextType,
//            mc = Taco.app.context.getMasterCatalog(),
//            excludeDefaultLocale = true,
//            supportedLocales = [];
//        if (ctxType === 'm' && mc) {
//            supportedLocales = mc.getSupportedLocales(excludeDefaultLocale);
//        }
//        else if (ctxType === 'c') {
//            var cat = Taco.app.context.getCatalog();
//            if (cat) {
//                supportedLocales.push(cat.localeCode);
//            }
//        }
//        return supportedLocales;
//    },

//    getQuickFilterData: function () {
//        // need to 
//        var supportedLocales = this.getSupportedLocales(),
//              quickFilters = [
//                              [{ hasRecord: false }, 'Missing Translation'],
//                              [{ hasRecord: true }, 'Has Translation'],
//                              [{}, 'All Records']
//              ];

//        Ext.Array.each(supportedLocales, function (loc) {
//            quickFilters.push([{ localeNotExists: loc }, 'Missing ' + loc]);
//            quickFilters.push([{ localeExists: loc }, 'Has ' + loc]);
//        });
//        return quickFilters;
//    },

//    getAdvancedSearchConfig: function () {
//        return {
//            advancedFormCls: 'Taco.view.settings.localization.AdvancedSearchLocaleForm',

//            quickFilterData: this.getQuickFilterData()
//                //Taco.view.settings.localization.util.Locales.getQuickFilterData()
//        };
//    }
//});