using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{


    public class TaxMapping : Profile
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
            AutoMapper.Mapper.CreateMap<Mozu.SiteBuilder.UX.Admin.Api.Models.Tax.TaxRate, Mozu.ProductAdmin.Contracts.TaxRate>();
            AutoMapper.Mapper.CreateMap<Mozu.ProductAdmin.Contracts.TaxRate, Mozu.SiteBuilder.UX.Admin.Api.Models.Tax.TaxRate>();
        }
    }
}