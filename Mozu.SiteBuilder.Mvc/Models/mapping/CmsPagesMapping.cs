using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
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

        public override string ProfileName
        {
            get
            {
                return this.GetType().FullName;
            }
        }
        protected override void Configure()
        {

            Mapper.CreateMap<DC.Facet, VM.Facet>();
            Mapper.CreateMap<VM.Facet, DC.Facet>();

            var defaultFlags = ToDict(new Models.Admin.CMS.DocListFlags { EnableActiveDateRange = false, EnablePublishing = false, SupportsActiveDateRange = false, SupportsPublishing = false });

            Mapper.CreateMap<DC.Document, IDictionary<string, object>>()
               .ConstructUsing((DC.Document doc) =>
               {

                   var dic = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase) {
                        { "documentName", doc.Name  },
                        { "documentListName", doc.ListFQN ??"pages@mozu"} ,
                        { "documentListFQN", doc.ListFQN  ?? "pages@mozu"} ,
                        { "documentType", doc.DocumentTypeFQN ??"web_page@mozu"  } ,
                        { "documentTypeFQN", doc.DocumentTypeFQN  ??"web_page@mozu"  } ,
                        { "documentdocumentTypeFQN", doc.DocumentTypeFQN  ??"web_page@mozu" },
                    };
                   if (doc.Properties != null)
                   {
                       foreach (var prop in doc.Properties.Properties().Cast<JProperty>().Where(x => x.Value is JValue))
                       {
                           dic["documentProperty-" + prop.Name] = ((JValue)prop.Value).Value;
                       }
                   }
                   return dic;
               });

            Mapper.CreateMap<DC.Document, Models.Admin.CMS.DocumentWithListInfo>()
                .ForMember(x => x.ActiveDateRange, m => m.ResolveUsing(n => n.ActiveDateRange))
                .ForMember(x => x.ContentLength, m => m.ResolveUsing(n => n.ContentLength))
                .ForMember(x => x.ContentMimeType, m => m.ResolveUsing(n => n.ContentMimeType))
                .ForMember(x => x.ContentUpdateDate, m => m.ResolveUsing(n => n.ContentUpdateDate))
                .ForMember(x => x.DocumentTypeFQN, m => m.ResolveUsing(n => n.DocumentTypeFQN))
                .ForMember(x => x.Extension, m => m.ResolveUsing(n => n.Extension))
                .ForMember(x => x.Id, m => m.ResolveUsing(n => n.Id))
                .ForMember(x => x.InsertDate, m => m.ResolveUsing(n => n.InsertDate))
                .ForMember(x => x.ListFQN, m => m.ResolveUsing(n => n.ListFQN))
                .ForMember(x => x.Name, m => m.ResolveUsing(n => n.Name))
                .ForMember(x => x.Properties, m => m.ResolveUsing(n => n.Properties))
                .ForMember(x => x.PublishSetCode, m => m.ResolveUsing(n => n.PublishSetCode))
                .ForMember(x => x.PublishState, m => m.ResolveUsing(n => n.PublishState))
                .ForMember(x => x.UpdateDate, m => m.ResolveUsing(n => n.UpdateDate));

            Mapper.CreateMap<JObject, JObject>().ConstructUsing(x => x);
            Mapper.CreateMap<JContainer, JContainer>().ConstructUsing(x => x);

            Mapper.CreateMap<Mozu.Content.Contracts.DocumentDraftSummary, Mozu.SiteBuilder.UX.Models.Admin.CMS.DocumentDraft>()
                .ForMember(d => d.Id, m => m.MapFrom(dc => dc.Id))
                .ForMember(d => d.DraftType, m => m.ResolveUsing(dc => dc.ListFQN.ToLowerInvariant() == "pages@mozu" ? "Page" : "Other"))
                .ForMember(d => d.ListFQN,m => m.ResolveUsing(dc => dc.ListFQN))

                .ForMember(d => d.Name, m => m.ResolveUsing(dc => dc.Name))
                .ForMember(d => d.ModificationType, m => m.ResolveUsing(dc => dc.PublishType))
                .ForMember(d => d.ModifiedBy, m => m.MapFrom(dc =>dc.UpdatedBy))
                .ForMember(d => d.LastModified, m => m.MapFrom(dc => dc.DraftUpdateDate))
                .ForMember(d => d.LastPublished, m => m.MapFrom(dc => dc.ActiveUpdateDate ))
                .ForMember(d => d.IsPublished, m => m.Ignore() )
                ;
        }
        
        string blurg (DC.Document doc )
        {
            return doc.DocumentTypeFQN;
        }
    }
}



