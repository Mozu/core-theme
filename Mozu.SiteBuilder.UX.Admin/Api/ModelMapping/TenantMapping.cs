using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using AutoMapper;
using Mozu.SiteBuilder.UX.Models.Admin;
using DC = Mozu.Tenant.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    

    public class TenantMapping : Profile
    {
        public override string ProfileName { get { return this.GetType().FullName; } }

        protected override void Configure()
        {
            AutoMapper.Mapper.CreateMap<DC.Tenant, TaContext>()
                .ForMember(x => x.Id, op => op.MapFrom(x => x.Id))
                .ForMember(x => x.Name, op => op.MapFrom(x => x.Name))
                .ForMember(x => x.SiteCollections, op => op.MapFrom(x => x.SiteGroups))
                ;


            AutoMapper.Mapper.CreateMap<DC.SiteGroup, TaContextSiteCollection >()
                .ForMember(x => x.Id, op => op.MapFrom(x => x.Id))
                .ForMember(x => x.Name, op => op.MapFrom(x => x.Name))
                .ForMember(x => x.Sites, op => op.MapFrom(x => x.Sites))
                ;


            AutoMapper.Mapper.CreateMap<DC.Site, TaContextSite>()
                .ForMember(x => x.Id, op => op.MapFrom(x => x.Id))
                .ForMember(x => x.Name, op => op.MapFrom(x => x.Name))
                .ForMember(x => x.StagingHost, op => op.MapFrom(x => x.Domains == null ? null : x.Domains.Where(d => d.IsSystemAssigned).Select(d => d.DomainName).FirstOrDefault()));


            AutoMapper.Mapper.CreateMap<Mozu.ProductAdmin.Contracts.SiteGroupCollection, TaContext>()
                .AfterMap((dc, tacontext) => {
                    // map ProductPublishingMode to each sitegroup in the collection.
                    foreach (var sitegroup in dc.Items)
                    {
                        var sitegroupInTacontext = tacontext.SiteCollections.FirstOrDefault(s => s.Id == sitegroup.Id);
                        if (sitegroupInTacontext != null)
                            sitegroupInTacontext.ProductPublishingMode = sitegroup.ProductPublishingMode;
                    }

                    // TODO: hard-coding a default value for now, in case the service doesn't always return a value.
                    tacontext.SiteCollections.Each(sc => { if (sc.ProductPublishingMode == null) sc.ProductPublishingMode = Mozu.ProductAdmin.Contracts.SiteGroup.ProductPublishingModeConst.Live; });

                })
                .ForAllMembers(op => op.Ignore())
                ;
        }
    }
}
