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
                      .ForMember(x => x.Id, op => op.ResolveUsing(x => x.Id))
                      .ForMember(x => x.Name, op => op.ResolveUsing(x => x.Name))
                      .ForMember(x => x.MasterCatalogs, op => op.ResolveUsing(x => x.MasterCatalogs))
                      .ForMember(x => x.ContentPublishingEnabled, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-28
                      .ForMember(x => x.Currencies, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-28 
                      .AfterMap((tenant, context) =>
                          {
                              foreach (var site in tenant.Sites)
                              {
                                  var mc = context.MasterCatalogs.FirstOrDefault(x => x.Id == site.MasterCatalogId);
                                  if (mc != null)
                                  {
                                      if (mc.Sites == null)
                                      {
                                          mc.Sites = new List<TaContextSite>();
                                      }
                                      mc.Sites.Add(Mapper.Map<TaContextSite>(site));
                                  }
                              }
                          });
                ;


            AutoMapper.Mapper.CreateMap<DC.MasterCatalog , MasterCatalog>()
                .ForMember(x => x.Id, op => op.ResolveUsing(x => x.Id))
                .ForMember(x => x.Name, op => op.ResolveUsing(x => x.Name))
                .ForMember(x => x.Catalogs, op => op.ResolveUsing(x => x.Catalogs ))
                .ForMember(x=> x.Currency ,op => op.ResolveUsing(x=> x.DefaultCurrencyCode))
                .ForMember(x => x.Locale, op => op.ResolveUsing(x => x.DefaultLocaleCode))
                //ignores
                .ForMember(x => x.ProductPublishingMode, op => op.Ignore())
                .ForMember(x => x.Sites, op => op.Ignore())
                .ForMember(x => x.ContentPublishingEnabled, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-28 
                ;
            AutoMapper.Mapper.CreateMap<DC.Catalog, TaContextCatalog>()
                .ForMember(x => x.Id, op => op.ResolveUsing(x => x.Id))
                .ForMember(x => x.Currency, op => op.ResolveUsing(x => x.DefaultCurrencyCode))
                .ForMember(x => x.Locale, op => op.ResolveUsing(x => x.DefaultLocaleCode))
                .ForMember(x => x.Name, op => op.ResolveUsing(x => x.Name))
                .ForMember(x => x.ContentPublishingEnabled, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-28
                ;
            
              //.ForMember(x => x.StagingHost, op => op.ResolveUsing(x => x.Domains == null ? null : x.Domains.Where(d => d.IsSystemAssigned).Select(d => d.DomainName).FirstOrDefault()));


            AutoMapper.Mapper.CreateMap<DC.Site, TaContextSite>()
                .ForMember(x => x.Id, op => op.ResolveUsing(x => x.Id))
                .ForMember(x => x.Name, op => op.ResolveUsing(x => x.Name))
                .ForMember(x => x.Currency, op => op.ResolveUsing(x => x.DefaultCurrencyCode))
                .ForMember(x => x.Locale, op => op.ResolveUsing(x => x.DefaultLocaleCode))
                .ForMember(x => x.StagingHost, op => op.ResolveUsing(x => x.Domains == null 
                    ? null : 
                    x.Domains.Where(d => d.IsSystemAssigned).Select(d => d.DomainName).FirstOrDefault()))
                //ignores
                .ForMember(x => x.DefaultHost, op => op.Ignore())
                .ForMember(x => x.ContentPublishingEnabled, op => op.Ignore())
                ;

            AutoMapper.Mapper.CreateMap<Mozu.ProductAdmin.Contracts.MasterCatalogCollection , TaContext>()
                .AfterMap((dc, tacontext) => {
                    // map ProductPublishingMode to each sitegroup in the collection.
                    foreach (var sitegroup in dc.Items)
                    {
                        var sitegroupInTacontext = tacontext.MasterCatalogs.FirstOrDefault(s => s.Id == sitegroup.Id);
                        if (sitegroupInTacontext != null)
                            sitegroupInTacontext.ProductPublishingMode = sitegroup.ProductPublishingMode;
                    }

                    // TODO: hard-coding a default value for now, in case the service doesn't always return a value.
                    tacontext.MasterCatalogs.Each(sc =>
                        {
                            if (sc.ProductPublishingMode == null) 
                                sc.ProductPublishingMode = Mozu.ProductAdmin.Contracts.MasterCatalog.ProductPublishingModeConst.Live;
                        });

                })
                .ForAllMembers(op => op.Ignore())
                ;
        }
    }
}
