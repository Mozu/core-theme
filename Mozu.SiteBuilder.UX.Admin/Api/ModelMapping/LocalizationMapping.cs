using System;
using System.Data;
using System.Linq;
using System.Collections.Generic;
using AutoMapper;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;
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
            #region Attribute & Value

            //not used?
            //Mapper.CreateMap<LocalizedAttribute, DC.AttributeLocalizedContent>()
            //    .ForMember(dc => dc.LocaleCode, op => op.ResolveUsing(x => x.Locale))
            //    .ForMember(dc => dc.Name, op => op.ResolveUsing(x => x.Name))
            //    .ForMember(dc => dc.Description, op => op.ResolveUsing(x => x.Description))
            //    ;

            Mapper.CreateMap<DC.ReportAttribute, LocalizedAttribute>()
                .ForMember(x => x.AttributeFQN, op => op.ResolveUsing(dc => dc.AttributeFQN))
                .ForMember(x => x.AdminName, op => op.ResolveUsing(dc => dc.AdminName))
                .ForMember(x => x.Name, op => op.ResolveUsing(dc => dc.Name))
                .ForMember(x => x.Description, op => op.ResolveUsing(dc => dc.Description))
                .ForMember(x => x.Locale, op => op.ResolveUsing(dc => dc.LocaleCode))
                .ForMember(x => x.SupportedLocales, op => op.ResolveUsing(dc => (dc.LocalizedValues != null && dc.LocalizedValues.Count > 0) 
                    ? dc.LocalizedValues.Select(x => x.LocaleCode).ToList() 
                    : new List<string>()))
                    ;

            Mapper.CreateMap<DC.ReportAttribute, JObject>().ConvertUsing<ReportLocalizedAttributeConverter>();

            #endregion

            #region Product Extras

            Mapper.CreateMap<DC.ReportProductExtra, LocalizedProductExtraPrice>()
                .ForMember(x => x.ProductCode, op => op.ResolveUsing(dc => dc.ProductCode))
                .ForMember(x => x.ProductName, op => op.ResolveUsing(dc => dc.ProductName))
                .ForMember(x => x.AttributeFQN, op => op.ResolveUsing(dc => dc.AttributeFQN))
                .ForMember(x => x.AdminName, op => op.ResolveUsing(dc => dc.AdminName))
                //.ForMember(x => x.AttributeName, op => op.ResolveUsing(dc => dc.Value))
                .ForMember(x => x.CurrencyCode, op => op.ResolveUsing(dc => dc.CurrencyCode))
                .ForMember(x => x.DeltaPrice, op => op.ResolveUsing(dc => dc.DeltaPrice))
                .ForMember(x => x.SupportedCurrencies, op => op.ResolveUsing(dc => (dc.LocalizedDeltaPrices != null)
                    ? dc.LocalizedDeltaPrices.Select(x => x.CurrencyCode).ToList()
                    : new List<string>()))
                ;

            Mapper.CreateMap<DC.ReportProductExtra, JObject>().ConvertUsing<ReportLocalizedProductExtraConverter>();


            #endregion

            #region Product Variants

            Mapper.CreateMap<DC.ReportProductVariation, LocalizedProductVariantPrice>()
                .ForMember(x => x.ParentProductCode, op => op.ResolveUsing(dc => dc.ParentProductCode))
                .ForMember(x => x.VariantProductCode, op => op.ResolveUsing(dc => dc.VariantProductCode))
                .ForMember(x => x.ProductName, op => op.ResolveUsing(dc => dc.ProductName))
                .ForMember(x => x.DeltaMSRP, op => op.ResolveUsing(dc => dc.MSRP))
                .ForMember(x => x.DeltaCreditValue, op => op.ResolveUsing(dc => dc.CreditValue))
                .ForMember(x => x.DeltaPrice, op => op.MapFrom(dc => dc.Value)) //get ambiguous reference with ResolveUsing.
                .ForMember(x => x.CurrencyCode, op => op.ResolveUsing(dc => dc.CurrencyCode ))
                .ForMember(x => x.Options, op => op.ResolveUsing(dc => (dc.Options != null) 
                    ? dc.Options.Select(x => string.Format("{0} - {1}", x.AdminName, x.Value)).ToList()
                    : new List<string>()))
                ;

            Mapper.CreateMap<DC.ReportProductVariation, JObject>().ConvertUsing<ReportLocalizedProductVariantConverter>();


            #endregion
        }

        
    }

    public class ReportLocalizedAttributeConverter : ITypeConverter<DC.ReportAttribute, JObject>
    {
        public JObject Convert(ResolutionContext context)
        {
            var attr = context.SourceValue as DC.ReportAttribute;
            if (attr == null) return null;

            var localizedAttr = Mapper.Map<LocalizedAttribute>(attr);
            var jObj = ReportLocalizedConverterHelper.AddLocalizedNames(localizedAttr, attr.LocalizedValues);
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

    public class ReportLocalizedConverterHelper
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
                jResult[updatedLocalizedContent.LocaleCode + "_name"] = updatedLocalizedContent.Name;
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
                jResult[updatedLocalizedContent.LocaleCode + "_name"] = updatedLocalizedContent.Name;
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
            variant.SupportedCurrencies = updatedResults.Select(x => x.CurrencyCode).ToList();
            var jResult = JObject.FromObject(variant, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));

            foreach (var updatedLocalizedPrice in updatedResults)
            {
                jResult[string.Format(PRICE_FORMAT, updatedLocalizedPrice.CurrencyCode)] = updatedLocalizedPrice.Value;
                jResult[string.Format(MSRP_FORMAT, updatedLocalizedPrice.CurrencyCode)] = updatedLocalizedPrice.MSRP;
                jResult[string.Format(CREDIT_FORMAT, updatedLocalizedPrice.CurrencyCode)] = updatedLocalizedPrice.CreditValue;
            }
            return jResult;
        }

    }
    
    
}
