using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using Mozu.SiteSettings.General.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{

    public class TaxMapping : Profile
    {
        public TaxMapping()
        {
            CreateMap<Mozu.SiteBuilder.UX.Admin.Api.Models.Tax.TaxRate, TaxableTerritory>()
                      .ForMember(x => x.StateOrProvinceCode, opt => opt.ResolveUsing(x => x.StateCode))
                      .ForMember(dc => dc.IsShippingTaxable, op => op.Ignore())
                      ;
            CreateMap<TaxableTerritory, Mozu.SiteBuilder.UX.Admin.Api.Models.Tax.TaxRate>()
                .ForMember(x => x.StateCode, opt => opt.ResolveUsing(x => x.StateOrProvinceCode))
                .ForMember(x => x.id, op => op.Ignore())
                ;
        }
    }
}