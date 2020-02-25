using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using Mozu.Content.Contracts;
using Mozu.Core.Extensions;
using Newtonsoft.Json.Linq;
using DC = Mozu.Content.Contracts;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class CmsPagesMapping : Profile
    {
        static Dictionary<string,object> ToDict(Models.Admin.CMS.DocListFlags flags)
        {
            return new Dictionary<string, object>
            {
                { "supportsADR", flags.SupportsActiveDateRange},
                { "enableADR", flags.EnableActiveDateRange},
                { "supportsPublishing", flags.SupportsPublishing},
                { "enablePublishing", flags.EnablePublishing}
            };
        }

        private class DocumentToDictionaryConverter : ITypeConverter<DC.Document, IDictionary<string, object>>
        {
            public IDictionary<string, object> Convert(Document source, IDictionary<string, object> destination, ResolutionContext context)
            {
                var dic = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase)
                {
                    {"documentName", source.Name},
                    {"documentListName", source.ListFQN ?? "pages@mozu"},
                    {"documentListFQN", source.ListFQN ?? "pages@mozu"},
                    {"documentType", source.DocumentTypeFQN ?? "web_page@mozu"},
                    {"documentTypeFQN", source.DocumentTypeFQN ?? "web_page@mozu"},
                    {"documentdocumentTypeFQN", source.DocumentTypeFQN ?? "web_page@mozu"}
                };
                if (source.Properties == null) return dic;
                dic.AddRange(source.Properties.Properties().Where(x => x.Value is JValue).Select(p =>
                    new KeyValuePair<string, object>("documentProperty-" + p.Name, ((JValue)p.Value).Value)));
                return dic;
            }
        }

        public CmsPagesMapping()
        {

            CreateMap<DC.Facet, VM.Facet>();
            CreateMap<VM.Facet, DC.Facet>();

            var defaultFlags = ToDict(new Models.Admin.CMS.DocListFlags { EnableActiveDateRange = false, EnablePublishing = false, SupportsActiveDateRange = false, SupportsPublishing = false });

            CreateMap<DC.Document, IDictionary<string, object>>().ConvertUsing<DocumentToDictionaryConverter>();

            CreateMap<DC.Document, Models.Admin.CMS.DocumentWithListInfo>()
                .ForMember(x => x.ActiveDateRange, m => m.MapFrom(n => n.ActiveDateRange))
                .ForMember(x => x.ContentLength, m => m.MapFrom(n => n.ContentLength))
                .ForMember(x => x.ContentMimeType, m => m.MapFrom(n => n.ContentMimeType))
                .ForMember(x => x.ContentUpdateDate, m => m.MapFrom(n => n.ContentUpdateDate))
                .ForMember(x => x.DocumentTypeFQN, m => m.MapFrom(n => n.DocumentTypeFQN))
                .ForMember(x => x.Extension, m => m.MapFrom(n => n.Extension))
                .ForMember(x => x.Id, m => m.MapFrom(n => n.Id))
                .ForMember(x => x.InsertDate, m => m.MapFrom(n => n.InsertDate))
                .ForMember(x => x.ListFQN, m => m.MapFrom(n => n.ListFQN))
                .ForMember(x => x.Name, m => m.MapFrom(n => n.Name))
                .ForMember(x => x.Properties, m => m.MapFrom(n => n.Properties))
                .ForMember(x => x.PublishSetCode, m => m.MapFrom(n => n.PublishSetCode))
                .ForMember(x => x.PublishState, m => m.MapFrom(n => n.PublishState))
                .ForMember(x => x.UpdateDate, m => m.MapFrom(n => n.UpdateDate));

            CreateMap<JObject, JObject>().ConvertUsing(x => x);
            CreateMap<JContainer, JContainer>().ConvertUsing(x => x);

            CreateMap<Mozu.Content.Contracts.DocumentDraftSummary, Mozu.SiteBuilder.UX.Models.Admin.CMS.DocumentDraft>()
                .ForMember(d => d.Id, m => m.MapFrom(dc => dc.Id))
                .ForMember(d => d.DraftType, m => m.MapFrom(dc => dc.ListFQN.ToLowerInvariant() == "pages@mozu" ? "Page" : "Other"))
                .ForMember(d => d.ListFQN,m => m.MapFrom(dc => dc.ListFQN))
                .ForMember(d => d.Name, m => m.MapFrom(dc => dc.Name))
                .ForMember(d => d.ModificationType, m => m.MapFrom(dc => dc.PublishType))
                .ForMember(d => d.ModifiedBy, m => m.MapFrom(dc =>dc.UpdatedBy))
                .ForMember(d => d.LastModified, m => m.MapFrom(dc => dc.DraftUpdateDate))
                .ForMember(d => d.LastPublished, m => m.MapFrom(dc => dc.ActiveUpdateDate ))
                .ForMember(d => d.IsPublished, m => m.Ignore() );
        }
        
        string blurg (DC.Document doc )
        {
            return doc.DocumentTypeFQN;
        }
    }
}



