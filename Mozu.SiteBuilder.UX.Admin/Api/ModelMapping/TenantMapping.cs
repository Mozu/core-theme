using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using AutoMapper;
using Mozu.SiteBuilder.UX.Models.Admin;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    

    public class TenantMapping : Profile
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
            AutoMapper.Mapper.CreateMap<Mozu.Tenant.Contracts.Tenant, Mozu.SiteBuilder.UX.Models.Admin.TaContext>()
                      .ForMember(x => x.Id, op => op.MapFrom(x => x.Id))
                      .ForMember(x => x.Name, op => op.MapFrom(x => x.Name))
                      .ForMember(x => x.SiteCollections, op => op.MapFrom(x => x.SiteGroups));


            AutoMapper.Mapper.CreateMap<Mozu.Tenant.Contracts.SiteGroup , Mozu.SiteBuilder.UX.Models.Admin.TaContextSiteCollection >()
                .ForMember(x => x.Id, op => op.MapFrom(x => x.Id))
                      .ForMember(x => x.Name, op => op.MapFrom(x => x.Name))
                      .ForMember(x => x.Sites, op => op.MapFrom(x => x.Sites));


            AutoMapper.Mapper.CreateMap<Mozu.Tenant.Contracts.Site, Mozu.SiteBuilder.UX.Models.Admin.TaContextSite>()
                      .ForMember(x => x.Id, op => op.MapFrom(x => x.Id))
                      .ForMember(x => x.Name, op => op.MapFrom(x => x.Name))
                      .ForMember(x => x.StagingHost, op => op.MapFrom(x => x.Domains == null ? null : x.Domains.Where(d => d.IsSystemAssigned).Select(d => d.DomainName).FirstOrDefault()));

            AutoMapper.Mapper.CreateMap<Mozu.Tenant.Contracts.Tenant, Mozu.SiteBuilder.UX.Models.Admin.TaContext>()
              .ForMember(x => x.Id, op => op.MapFrom(x => x.Id))
              .ForMember(x => x.Name, op => op.MapFrom(x => x.Name))
;
        }
    }
}



