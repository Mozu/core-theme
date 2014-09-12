using System;
using System.Data;
using System.Linq;
using System.Collections.Generic;
using AutoMapper;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class LocalizationMapping : Profile
    {
        public override string ProfileName
        {
            get
            {
                return GetType().FullName;
            }
        }


        protected override void Configure()
        {
            MapReportAttributeToLocalizedAttribute();
            MapReportAttributeValueToLocalizedAttributeValue();

            MapReportProductPropertyToLocalizedProductProperty();
            MapReportProductExtraToLocalizedProductExtraPrice();
            MapReportProductVariationToLocalizedProductVariantPrice();
        }

        private static void MapReportAttributeToLocalizedAttribute()
        {

            Mapper.CreateMap<DC.ReportAttribute, LocalizedAttribute>()
                .ForMember(x => x.SupportedLocales,
                    op => op.ResolveUsing(dc => (dc.LocalizedValues != null && dc.LocalizedValues.Count > 0)
                        ? dc.LocalizedValues.Select(x => x.LocaleCode).ToList()
                        : new List<string>()))
                ;

            Mapper.CreateMap<DC.ReportAttribute, JObject>().ConvertUsing<ReportLocalizedAttributeConverter>();
        }

        private static void MapReportAttributeValueToLocalizedAttributeValue()
        {
            Mapper.CreateMap<DC.ReportAttributeValue, LocalizedAttributeValue>()
                .ForMember(x => x.AttributeFQN, op => op.ResolveUsing(dc => dc.AttributeFQN))
                .ForMember(x => x.AdminName, op => op.ResolveUsing(dc => dc.AdminName))
                .ForMember(x => x.AttributeName, op => op.MapFrom(dc => dc.Value as string))
                .ForMember(x => x.StringValue, op => op.ResolveUsing(dc => dc.StringValue))
                .ForMember(x => x.LocaleCode, op => op.ResolveUsing(dc => dc.LocaleCode))
                .ForMember(x => x.SupportedLocales,
                    op => op.ResolveUsing(dc => (dc.LocalizedValues != null && dc.LocalizedValues.Count > 0)
                        ? dc.LocalizedValues.Select(x => x.LocaleCode).ToList()
                        : new List<string>()))
                ;

            Mapper.CreateMap<DC.ReportAttributeValue, JObject>().ConvertUsing<ReportLocalizedAttributeValueConverter>();
        }

        private static void MapReportProductVariationToLocalizedProductVariantPrice()
        {
            Mapper.CreateMap<DC.ReportProductVariation, LocalizedProductVariantPrice>()
                .ForMember(x => x.ParentProductCode, op => op.ResolveUsing(dc => dc.ParentProductCode))
                .ForMember(x => x.VariantProductCode, op => op.ResolveUsing(dc => dc.VariantProductCode))
                .ForMember(x => x.ProductName, op => op.ResolveUsing(dc => dc.ProductName))
                .ForMember(x => x.DeltaMSRP, op => op.ResolveUsing(dc => dc.MSRP))
                .ForMember(x => x.DeltaCreditValue, op => op.ResolveUsing(dc => dc.CreditValue))
                .ForMember(x => x.DeltaPrice, op => op.MapFrom(dc => dc.Value)) //get ambiguous reference with ResolveUsing.
                .ForMember(x => x.CurrencyCode, op => op.ResolveUsing(dc => dc.CurrencyCode))
                .ForMember(x => x.Options, op => op.ResolveUsing(dc => (dc.Options != null)
                    ? dc.Options.Select(x => string.Format("{0} - {1}", x.AdminName, x.Value)).ToList()
                    : new List<string>()))
                .ForMember(x => x.SupportedCurrencies, op => op.Ignore())   // todo: xverify - Greg Murray on 2014-08-28
                ;

            Mapper.CreateMap<DC.ReportProductVariation, JObject>().ConvertUsing<ReportLocalizedProductVariantConverter>();
        }

        private static void MapReportProductExtraToLocalizedProductExtraPrice()
        {
            Mapper.CreateMap<DC.ReportProductExtra, LocalizedProductExtraPrice>()
                .ForMember(x => x.AttributeName, op => op.MapFrom(dc => dc.Value as string))
                .ForMember(x => x.SupportedCurrencies, op => op.ResolveUsing(dc => (dc.LocalizedDeltaPrices != null)
                    ? dc.LocalizedDeltaPrices.Select(x => x.CurrencyCode).ToList()
                    : new List<string>()))
                ;

            Mapper.CreateMap<DC.ReportProductExtra, JObject>().ConvertUsing<ReportLocalizedProductExtraConverter>();
        }

        private static void MapReportProductPropertyToLocalizedProductProperty()
        {
            Mapper.CreateMap<DC.ReportProductProperty, LocalizedProductProperty>()
                .ForMember(x => x.CanonicalValue, op => op.MapFrom(dc => dc.Value))
                .ForMember(x => x.SupportedLocales,
                    op => op.ResolveUsing(dc => (dc.LocalizedValues != null && dc.LocalizedValues.Count > 0)
                        ? dc.LocalizedValues.Select(x => x.LocaleCode).ToList()
                        : new List<string>()))
                ;

            Mapper.CreateMap<DC.ReportProductProperty, JObject>().ConvertUsing<ReportLocalizedProductPropertyConverter>();
        }

        
    }

    public class ReportLocalizedAttributeConverter : ITypeConverter<DC.ReportAttribute, JObject>
    {
        public JObject Convert(ResolutionContext context)
        {
            var attr = context.SourceValue as DC.ReportAttribute;
            if (attr == null) return null;

            var localizedAttr = Mapper.Map<LocalizedAttribute>(attr);
            var jObj = ReportAttributeConverterHelper.AddLocalizedNames(localizedAttr, attr.LocalizedValues);
            return jObj;
        }

    }

    public class ReportLocalizedAttributeValueConverter : ITypeConverter<DC.ReportAttributeValue, JObject>
    {
        public JObject Convert(ResolutionContext context)
        {
            var attrValue = context.SourceValue as DC.ReportAttributeValue;
            if (attrValue == null) return null;

            var localizedAttrValue = Mapper.Map<LocalizedAttributeValue>(attrValue);
            //var jObj = ReportAttributeConverterHelper.AddLocalizedNames(localizedAttr, attr.LocalizedValues);

            var jObj = ReportLocalizedConverterHelper.AddLocalizedValues("value_", localizedAttrValue, attrValue.LocalizedValues, 
                (property, locales) => property.SupportedLocales = locales, rptContent => rptContent.LocaleCode, rptContent => rptContent.StringValue,
                localizedAttrValue.LocaleCode, localizedAttrValue.SupportedLocales);

            return jObj;
        }

    }
    
    public class ReportLocalizedProductPropertyConverter : ITypeConverter<DC.ReportProductProperty, JObject>
    {
        public JObject Convert(ResolutionContext context)
        {
            var attr = context.SourceValue as DC.ReportProductProperty;
            if (attr == null) return null;

            var localizedAttr = Mapper.Map<LocalizedProductProperty>(attr);
            //var jObj = ReportLocalizedConverterHelper.AddLocalizedValues("value_", localizedAttr, attr.LocalizedValues);
            var jObj = ReportLocalizedConverterHelper.AddLocalizedValues("value_", localizedAttr, attr.LocalizedValues, (property, locales) => property.SupportedLocales = locales,
                rptContent => rptContent.LocaleCode, rptContent => rptContent.StringValue,
                localizedAttr.LocaleCode, localizedAttr.SupportedLocales);
            return jObj;
        }

    }

    public class ReportLocalizedProductExtraConverter : ITypeConverter<DC.ReportProductExtra, JObject>
    {
        public JObject Convert(ResolutionContext context)
        {
            var variant = context.SourceValue as DC.ReportProductExtra;
            if (variant == null) return null;

            var localizedExtra = Mapper.Map<LocalizedProductExtraPrice>(variant);
            var jObj = ReportLocalizedConverterHelper.AddLocalizedPrices(localizedExtra, variant.LocalizedDeltaPrices);
            return jObj;
        }
    }
    
    public class ReportLocalizedProductVariantConverter : ITypeConverter<DC.ReportProductVariation, JObject>
    {
        public JObject Convert(ResolutionContext context)
        {
            var variant = context.SourceValue as DC.ReportProductVariation;
            if (variant == null) return null;

            var localizedVariant = Mapper.Map<LocalizedProductVariantPrice>(variant);
            var jObj = ReportLocalizedConverterHelper.AddLocalizedPrices(localizedVariant, variant.LocalizedDeltaPrices);
            return jObj;
        }
    }

    public class ReportAttributeConverterHelper
    {
        /// <summary>
        /// adds localized names
        /// </summary>
        /// <param name="attr"></param>
        /// <param name="reportAttributeLocalizedContents"></param>
        /// <returns></returns>
        public static JObject AddLocalizedNames(LocalizedAttribute attr, List<DC.ReportAttributeLocalizedContent> reportAttributeLocalizedContents)
        {
            attr.SupportedLocales = reportAttributeLocalizedContents.Select(x => x.LocaleCode).ToList();
            var jResult = JObject.FromObject(attr, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));

            foreach (var updatedLocalizedContent in reportAttributeLocalizedContents)
            {
                jResult["name_" + updatedLocalizedContent.LocaleCode] = updatedLocalizedContent.Name;
            }
            return jResult;
        }

        /// <summary>
        /// result from update call to attribute service
        /// </summary>
        /// <param name="attr"></param>
        /// <param name="updatedResults"></param>
        /// <returns></returns>
        public static JObject AddLocalizedNames(LocalizedAttribute attr, List<DC.AttributeLocalizedContent> updatedResults)
        {
            attr.SupportedLocales = updatedResults.Select(x => x.LocaleCode).ToList();
            var jResult = JObject.FromObject(attr, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));

            foreach (var updatedLocalizedContent in updatedResults)
            {
                jResult["name_" + updatedLocalizedContent.LocaleCode] = updatedLocalizedContent.Name;
            }
            return jResult;
        }
    }

    public class ReportLocalizedConverterHelper
    {

        /// <summary>
        /// adds localized names
        /// </summary>
        /// <param name="prop"></param>
        /// <param name="attrValueLocalizedContents"></param>
        /// <example>var jResult = ReportLocalizedConverterHelper.AddLocalizedValues("value_", 
        ///         localizedAttrValue, updatedResults, 
        ///         (property, locales) => property.SupportedLocales = locales,
        ///         rptContent => rptContent.LocaleCode, rptContent => rptContent.StringValue,
        ///         localizedAttrValue.LocaleCode, localizedAttrValue.SupportedLocales);</example>
        /// <returns>jObject with "name_fr-FR", etc.</returns>
        public static JObject AddLocalizedValues<T1, T2>(string prefix, T1 prop, List<T2> attrValueLocalizedContents, 
            Action<T1, List<string>> supportedLocalesAction, Func<T2, string> getLocaleCodeFunc, Func<T2, string> getValueFunc, 
            string defaultLocaleCode, List<string> supportedLocales) 
            where T1 : class where T2: class
        {

            RemoveDefault(defaultLocaleCode, attrValueLocalizedContents, getLocaleCodeFunc);
            var missingLocales = GetMissingSupportedItems(supportedLocales, attrValueLocalizedContents.Select(getLocaleCodeFunc));


            supportedLocalesAction(prop, attrValueLocalizedContents.Select(getLocaleCodeFunc).Concat(missingLocales).ToList());
            var jResult = JObject.FromObject(prop, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));

            foreach (var updatedLocalizedContent in attrValueLocalizedContents)
            {
                jResult[prefix + getLocaleCodeFunc(updatedLocalizedContent)] = getValueFunc(updatedLocalizedContent);
            }
            foreach (var loc in missingLocales)
            {
                jResult[prefix + loc] = null;
            }
            return jResult;
        }


        ///// <summary>
        ///// adds localized names
        ///// </summary>
        ///// <param name="prop"></param>
        ///// <param name="attrValueLocalizedContents"></param>
        ///// <returns></returns>
        //public static JObject AddLocalizedValues(LocalizedProductProperty prop, List<DC.ReportAttributeValueLocalizedContent> attrValueLocalizedContents)
        //{
        //    prop.SupportedLocales = attrValueLocalizedContents.Select(x => x.LocaleCode).ToList();
        //    var jResult = JObject.FromObject(prop, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));

        //    foreach (var updatedLocalizedContent in attrValueLocalizedContents)
        //    {
        //        jResult["value_" + updatedLocalizedContent.LocaleCode] = updatedLocalizedContent.StringValue;
        //    }
        //    return jResult;
        //}

        /// <summary>
        /// result from update call to attribute service
        /// </summary>
        /// <param name="prop"></param>
        /// <param name="updatedResults"></param>
        /// <returns></returns>
        public static JObject AddLocalizedValues(LocalizedProductProperty prop, List<DC.AttributeVocabularyValueLocalizedContent> updatedResults)
        {
            prop.SupportedLocales = updatedResults.Select(x => x.LocaleCode).ToList();
            var jResult = JObject.FromObject(prop, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));

            foreach (var updatedLocalizedContent in updatedResults)
            {
                jResult["value_" + updatedLocalizedContent.LocaleCode] = updatedLocalizedContent.StringValue;
            }
            return jResult;
        }

        private const string PRICE_FORMAT = "price_{0}";
        private const string MSRP_FORMAT = "msrp_{0}";
        private const string CREDIT_FORMAT = "credit_{0}";


        public static JObject AddLocalizedPrices(LocalizedProductExtraPrice extra, List<DC.ReportProductExtraDeltaPrice> reportLocalizedPrices)
        {
            extra.SupportedCurrencies = reportLocalizedPrices.Select(x => x.CurrencyCode).Distinct().ToList();
            var jResult = JObject.FromObject(extra, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));

            foreach (var localizedPrice in reportLocalizedPrices)
            {
                jResult[string.Format(PRICE_FORMAT, localizedPrice.CurrencyCode)] = localizedPrice.DeltaPrice;
            }
            return jResult;
        }

        // todo: refactor using generics - Greg Murray on 2014-07-19 
        public static JObject AddLocalizedPrices(LocalizedProductExtraPrice extra, List<DC.ProductExtraValueDeltaPrice> updatedResults)
        {
            RemoveDefault(extra.CurrencyCode, updatedResults, deltaPrice => deltaPrice.CurrencyCode);
            var missingCurrencies = GetMissingSupportedItems(extra.SupportedCurrencies, updatedResults.Select(x => x.CurrencyCode));

            extra.SupportedCurrencies = updatedResults.Select(x => x.CurrencyCode).Concat(missingCurrencies).ToList();
            var jResult = JObject.FromObject(extra, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));

            foreach (var localizedPrice in updatedResults)
            {
                jResult[string.Format(PRICE_FORMAT, localizedPrice.CurrencyCode)] = localizedPrice.DeltaPrice;
            }
            //have to do this becuase DeltaPrice is not nullable and results in 0.
            foreach (var currencyCode in missingCurrencies)
            {
                jResult[string.Format(PRICE_FORMAT, currencyCode)] = null;
            }
            return jResult;
        }
        
        public static JObject AddLocalizedPrices(LocalizedProductVariantPrice variant, List<DC.ReportProductVariationDeltaPrice> reportLocalizedPrices)
        {
            variant.SupportedCurrencies = reportLocalizedPrices.Select(x => x.CurrencyCode).Distinct().ToList();
            var jResult = JObject.FromObject(variant, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));

            foreach (var localizedPrice in reportLocalizedPrices)
            {
                jResult[string.Format(PRICE_FORMAT, localizedPrice.CurrencyCode)] = localizedPrice.Value;
                jResult[string.Format(MSRP_FORMAT, localizedPrice.CurrencyCode)] = localizedPrice.MSRP;
                jResult[string.Format(CREDIT_FORMAT, localizedPrice.CurrencyCode)] = localizedPrice.CreditValue;
            }
            return jResult;
        }

        public static JObject AddLocalizedPrices(LocalizedProductVariantPrice variant, List<DC.ProductVariationDeltaPrice> updatedResults)
        {
            RemoveDefault(variant.CurrencyCode, updatedResults, x=>x.CurrencyCode);
            var missingCurrencies = GetMissingSupportedItems(variant.SupportedCurrencies, updatedResults.Select(x => x.CurrencyCode));

            variant.SupportedCurrencies = updatedResults.Select(x => x.CurrencyCode).Concat(missingCurrencies).ToList();
            var jResult = JObject.FromObject(variant, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));

            foreach (var updatedLocalizedPrice in updatedResults)
            {
                jResult[string.Format(PRICE_FORMAT, updatedLocalizedPrice.CurrencyCode)] = updatedLocalizedPrice.Value;
                jResult[string.Format(MSRP_FORMAT, updatedLocalizedPrice.CurrencyCode)] = updatedLocalizedPrice.MSRP;
                jResult[string.Format(CREDIT_FORMAT, updatedLocalizedPrice.CurrencyCode)] = updatedLocalizedPrice.CreditValue;
            }
            //have to do this becuase DeltaPrice is not nullable and results in 0.
            foreach (var currencyCode in missingCurrencies)
            {
                jResult[string.Format(PRICE_FORMAT, currencyCode)] = null;
                jResult[string.Format(MSRP_FORMAT, currencyCode)] = null;
                jResult[string.Format(CREDIT_FORMAT, currencyCode)] = null;
            }
            return jResult;
        }

        private static IEnumerable<string> GetMissingSupportedItems(IEnumerable<string> supportedItems, IEnumerable<string> updatedResultItems)
        {
            return supportedItems
                .Except(updatedResultItems)
                .ToList();
        }

        private static void RemoveDefault<T>(string defaultCode, List<T> updatedResults, Func<T, string> getCodeFunc) 
            where T : class
        {
            var defaultItem = updatedResults.FirstOrDefault(x => defaultCode.EqualsIgnoreCase(getCodeFunc(x)));
            if (defaultItem != null)
                updatedResults.Remove(defaultItem);
        }
    }
    
    
}
