using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Storefront;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class StorefrontProductModelMapping : Profile
    {
        protected override void Configure()
        {
            base.Configure();
            Mapper.CreateMap<ProductRuntime.Contracts.Product, StorefrontProduct>()
                .ForMember(d=>d.Name, o=>o.ResolveUsing(s=> s.Content != null ? s.Content.ProductName : string.Empty))
                .ForMember(d=>d.Price, o=>o.ResolveUsing(s => s.Price != null
                    ? s.Price.CatalogListPrice
                    : (s.PriceRange != null ? (s.PriceRange.Lower != null ? s.PriceRange.Lower.Price : null  ): ((decimal?)null))))
                .ForMember(d=>d.SalePrice, o=>o.ResolveUsing(s=> s.Price != null
                    ? s.Price.SalePrice
                    : (s.PriceRange != null ? (s.PriceRange.Lower != null ? s.PriceRange.Lower.SalePrice : null) : ((decimal?)null))))
                ;
        }

        public override string ProfileName
        {
            get { return GetType().FullName; }
        }
    }
}