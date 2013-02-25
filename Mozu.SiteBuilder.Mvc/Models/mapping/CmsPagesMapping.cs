using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using DC = Mozu.Content.Contracts;
using VM = Mozu.SiteBuilder.Mvc.Models.CMS;
using System.Web.Mvc;
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

            Mapper.CreateMap<DC.Document, VM.Document>()
                .ForMember (x=> x.DocumentType ,  op=> op.MapFrom ( x=> x.DocumentType ))
                .ForMember(x => x.Collection, op => op.MapFrom(_ => _.DocumentListName  ))
                
                .ConstructUsingServiceLocator();
            //Mapper.CreateMap<DC.Document, VM.WidgetInstance >()
            //    .ForMember(x => x.DocumentType, op => op.MapFrom(x => x.DocumentType))
            //    .ForMember(x => x.Collection, op => op.MapFrom(_ => _.ContentCollection))
            //    .AfterMap((x, y) => y.Init())
           //     .ConstructUsingServiceLocator();
            Mapper.CreateMap<DC.Document, VM.Blog >()
                .ForMember(x => x.DocumentType, op => op.MapFrom(x => x.DocumentType))
                .ForMember(x => x.Collection, op => op.MapFrom(_ => _.DocumentListName))
                .ConstructUsingServiceLocator();
            Mapper.CreateMap<DC.Document, VM.Post >()
                .ForMember(x => x.DocumentType, op => op.MapFrom(x => x.DocumentType))
                .ForMember(x => x.Collection, op => op.MapFrom(_ => _.DocumentListName))
                .ConstructUsingServiceLocator(); 
            Mapper.CreateMap<VM.Document, DC.Document>();
            Mapper.CreateMap<DC.PropertyValue, VM.CmsProperty>()
                .ForMember(x => x.Key  , op => op.MapFrom(_ => _.PropertyType))
                .ForMember(x => x.RawValue , op => op.MapFrom(_ => _.Value ))
                .ConstructUsingServiceLocator(); 

            Mapper.CreateMap<VM.CmsProperty, DC.PropertyValue>();
            //Mapper.AssertConfigurationIsValid(this.ProfileName);

            Mapper.CreateMap<Mozu.Content.Contracts.Document, Mvc.Models.CMS.Admin.Document>()
                .ForMember(x => x.Items, m => m.MapFrom(x => x.Properties));
            Mapper.CreateMap<Mvc.Models.CMS.Admin.Document, Mozu.Content.Contracts.Document>()
                .ForMember(x => x.Properties, m => m.MapFrom(x => x.Items));

            Mapper.CreateMap<Mozu.Content.Contracts.PropertyValue, Mvc.Models.CMS.Admin.DocumentProperty>()
                .ForMember(x => x.Key, m => m.MapFrom(x => x.PropertyType));
            Mapper.CreateMap<Mvc.Models.CMS.Admin.DocumentProperty, Mozu.Content.Contracts.PropertyValue>()
                .ForMember(x => x.PropertyType, m => m.MapFrom(x => x.Key));


            Mapper.CreateMap<Mozu.Content.Contracts.Document, Mozu.SiteBuilder.UX.Models.Admin.CMS.DocumentDraft>()
                .ForMember(d => d.Id, m => m.MapFrom(dc => dc.Id))
                .ForMember(d => d.DraftType, m => m.ResolveUsing(dc => dc.DocumentListName.ToLowerInvariant() == "pages" ? "Page" : "Template"))
                .ForMember(d => d.Name, m => m.MapFrom(dc => dc.Name))
                .ForMember(d => d.ModificationType, m => m.ResolveUsing(dc => dc.InsertDate == null ? "Created" : "Modified"))
                .ForMember(d => d.ModifiedBy, m => m.MapFrom(dc => "James Zetlen"))
                .ForMember(d => d.LastModified, m => m.MapFrom(dc => dc.UpdateDate))
                .ForMember(d => d.LastPublished, m => m.MapFrom(dc => dc.InsertDate))
                ;

        }
        
        string blurg (DC.Document doc )
        {
            return doc.DocumentType;
        }
    }
}



