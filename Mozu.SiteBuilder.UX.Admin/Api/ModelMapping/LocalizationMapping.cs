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

            Mapper.CreateMap<LocalizedAttribute, DC.AttributeLocalizedContent>()
                .ForMember(dc => dc.LocaleCode, op => op.ResolveUsing(x => x.Locale))
                .ForMember(dc => dc.Name, op => op.ResolveUsing(x => x.Name))
                .ForMember(dc => dc.Description, op => op.ResolveUsing(x => x.Description))
                ;

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

            #region


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
            var jObj = AddLocalizedNames(localizedAttr, attr.LocalizedValues);
            return jObj;
        }

        private JObject AddLocalizedNames(LocalizedAttribute attr, List<DC.ReportAttributeLocalizedContent> reportAttributeLocalizedContents)
        {
            attr.SupportedLocales = reportAttributeLocalizedContents.Select(x => x.LocaleCode).ToList();
            var jResult = JObject.FromObject(attr, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));

            foreach (var updatedLocalizedContent in reportAttributeLocalizedContents)
            {
                jResult[updatedLocalizedContent.LocaleCode + "_name"] = updatedLocalizedContent.Name;
            }
            return jResult;
        }
    }
}
