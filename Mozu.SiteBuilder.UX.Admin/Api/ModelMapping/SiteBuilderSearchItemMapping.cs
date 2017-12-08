using System;
using System.Collections.Generic;
using AutoMapper;
using System.Linq;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Facets;
using Mozu.SiteBuilder.UX.Admin.Api.Models.SiteBuilder;
using Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class SiteBuilderSearchItemMapping : Profile
    {
        public SiteBuilderSearchItemMapping()
        {
            // Category To Search Item
            CreateMap<DC.Category, SearchItem>()
               .ForMember(x => x.Name, opt => opt.ResolveUsing(dc => dc.Content.Name))
               .ForMember(x => x.Url, opt => opt.ResolveUsing(dc => dc.CategoryCode))
               .ForMember(x => x.IsCategory, opt => opt.UseValue(true))
               .ForMember(x => x.isDocument, opt => opt.UseValue(false))
                ;

            CreateMap<Document, SearchItem>()
             .ForMember(x => x.Name, opt => opt.ResolveUsing(dc => dc.Properties.GetValue("link_title") != null ? dc.Properties.GetValue("link_title") : dc.Name))
             .ForMember(x => x.Url, opt => opt.ResolveUsing(dc => dc.Name))
             .ForMember(x => x.IsCategory, opt => opt.UseValue(false))
             .ForMember(x => x.isDocument, opt => opt.UseValue(true))
             .ForMember(x => x.Id, opt => opt.ResolveUsing(dc => dc.Id))
              ;

        }


    }
}