using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.UX.Admin.Api.Models.AppManagement;
using Mozu.Tenant.Contracts;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using DC = Mozu.Content.Contracts;


namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class ContentMapping : Profile
    {
        static Dictionary<string, object> ToDict(UX.Models.Admin.CMS.DocListFlags flags)
        {
            return new Dictionary<string, object>
            {
                { "supportsADR", flags.SupportsActiveDateRange},
                { "enableADR", flags.EnableActiveDateRange},
                { "supportsPublishing", flags.SupportsPublishing},
                { "enablePublishing", flags.EnablePublishing}
            };
        }

        public override string ProfileName
        {
            get { return GetType().FullName; }
        }
        static Lazy<JsonSerializer> _ser = new Lazy<JsonSerializer>(() => JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));
        DateTime? GetDate( JObject jobj , string key )
        {
            JToken jtoken;
            if (jobj.TryGetValue(key, StringComparison.OrdinalIgnoreCase, out jtoken) && jtoken is JValue && ((JValue)jtoken).Type == JTokenType.Date)
            {
                return (DateTime)((JValue)jtoken).Value;
            }
            return null;
        }
        static Dictionary<string, object> defaultFlags = ToDict(new UX.Models.Admin.CMS.DocListFlags { EnableActiveDateRange = false, EnablePublishing = false, SupportsActiveDateRange = false, SupportsPublishing = false });

        protected override void Configure()
        {
            Mapper.CreateMap<UX.Models.Admin.CMS.DocumentWithListInfo, JObject>()
                .ConstructUsing((UX.Models.Admin.CMS.DocumentWithListInfo doc) =>
                    {
                        if (doc == null) return null;
                        var jobj = JObject.FromObject(doc, _ser.Value);
                        jobj["startDate"] = doc.ActiveDateRange == null ? null : doc.ActiveDateRange.StartDate;
                        jobj["endDate"] = doc.ActiveDateRange == null ? null : doc.ActiveDateRange.EndDate;
                        jobj["listFlags"] = JObject.FromObject(doc.ListFlags == null ? defaultFlags : ToDict(doc.ListFlags));
                        return jobj;
                    }
                );
            Mapper.CreateMap<JObject, UX.Models.Admin.CMS.DocumentWithListInfo>()
                .ConstructUsing((JObject jobj) =>
                {
                    if (jobj == null) return null;
                    var doc = jobj.ToObject<UX.Models.Admin.CMS.DocumentWithListInfo>();
                    var flags = jobj["listFlags"];
                    doc.ListFlags = new UX.Models.Admin.CMS.DocListFlags
                    {
                        EnableActiveDateRange = flags["enableADR"].Value<bool>(),
                        EnablePublishing = flags["enablePublishing"].Value<bool>(),
                        SupportsActiveDateRange = flags["supportsADR"].Value<bool>(),
                        SupportsPublishing = flags["supportsPublishing"].Value<bool>()
                    };
                    return doc;
                });
            Mapper.CreateMap<DC.Document, JObject>()
                .ConstructUsing((DC.Document doc) =>
                {
                    if (doc == null)
                    {
                        return null;
                    }
                    var jobj = JObject.FromObject(doc, _ser.Value);
                    jobj["startDate"] = doc.ActiveDateRange == null ? null : doc.ActiveDateRange.StartDate;
                    jobj["endDate"] = doc.ActiveDateRange == null ? null : doc.ActiveDateRange.EndDate;
                    return jobj;
                }).ForAllMembers(x => x.Ignore());
            Mapper.CreateMap<JObject, DC.Document>()
               .ConstructUsing((JObject jobj) =>
                   {
                       if ( jobj == null )
                    {
                        return null;
                       }
                       var doc = jobj.ToObject<DC.Document>();
                       doc.ActiveDateRange = new DC.ActiveDateRange()
                       {
                           EndDate = GetDate(jobj, "endDate"),
                           StartDate = GetDate(jobj, "startDate")
                       };
                       return doc;
                   }).ForAllMembers(x => x.Ignore());
               

           
        }
    }
}