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


            Mapper.CreateMap<Mozu.Content.Contracts.Document, IDictionary<string, object>>()
               .ConstructUsing((Mozu.Content.Contracts.Document doc) =>
               {

                   var dic = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase) {
                        { "documentName", doc.Name  },
                        { "documentListName", doc.ListFQN ??"pages@mozu"} ,
                        { "documentListFQN", doc.ListFQN  ?? "pages@mozu"} ,
                        { "documentType", doc.DocumentTypeFQN ??"web_page@mozu"  } ,
                        { "documentTypeFQN", doc.DocumentTypeFQN  ??"web_page@mozu"  } ,
                        { "documentdocumentTypeFQN", doc.DocumentTypeFQN  ??"web_page@mozu" }
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



