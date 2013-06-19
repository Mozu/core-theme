using System;
using System.Collections.Generic;
using AutoMapper;
using System.Linq;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Discount;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class DiscountMapping : Profile
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
            // To model
            Mapper.CreateMap<DC.Discount, Discount>()
                  .ForMember(x => x.TargetType, opt => opt.MapFrom(x=> x.Target.Type ))
                  .ForMember(x => x.IncludeAllProducts   , opt => opt.MapFrom(x=> x.Target.IncludeAllProducts  ))
                  .ForMember(x => x.Categories    , opt => opt.MapFrom(x=> (x.Target.Categories ?? Enumerable.Empty<DC.TargetedCategory>()).Select( _=> _.Id ).ToList()  ))
                  .ForMember(x => x.Products     , opt => opt.MapFrom(x=> (x.Target.Products  ?? Enumerable.Empty<DC.TargetedProduct >()).Select( _=> _.Code  ).ToList()  ))
                  .ForMember(x => x.ShippingMethods     , opt => opt.MapFrom(x=> (x.Target.ShippingMethods   ?? Enumerable.Empty<DC.TargetedShippingMethod  >()).Select( _=> _.Code  ).ToList()  ))
                  .ForMember(x => x.MinimumOrderAmount     , opt => opt.MapFrom(x=> x.Target.MinimumOrderAmount   ))
                  .ForMember(x => x.Name , op => op.ResolveUsing(dc => dc.Content.Name ));

            // To data contract
            Mapper.CreateMap<Discount, DC.Discount>()
                  .ForMember(x => x.Content, opt => opt.MapFrom(x => new DC.DiscountLocalizedContent() {Name = x.Name}))
                  .ForMember(x => x.Target, opt => opt.MapFrom(x => new DC.DiscountTarget()
                                                                        {
                                                                            Type = x.TargetType,
                                                                            Categories = (x.Categories ?? Enumerable.Empty<int>()).Select(_ => new DC.TargetedCategory() {Id = _}).ToList(),
                                                                            Products = (x.Products ?? Enumerable.Empty<string>()).Select(_ => new DC.TargetedProduct() {Code = _}).ToList(),
                                                                            ShippingMethods = (x.ShippingMethods ?? Enumerable.Empty<string>()).Select(_ => new DC.TargetedShippingMethod() {Code = _}).ToList(),
                                                                            MinimumOrderAmount = x.MinimumOrderAmount,
                                                                            IncludeAllProducts = x.IncludeAllProducts
                                                                        }))
                  .AfterMap((s, d) =>
                      {
                          if (d.Target.IncludeAllProducts.GetValueOrDefault( false ))
                          {
                              d.Target.Products = null;
                              d.Target.Categories = null;
                          }
                      });





        }

        //private string MapToTargetType(DC.DiscountTarget t)
        //{
        //    if (t.IncludeAllProducts == true)
        //        return "AllProducts";
        //    if (t.Type.Equals("FreeShipping", StringComparison.InvariantCultureIgnoreCase))
        //        return "FreeShipping";
        //    if (t.Type.Equals("Product", StringComparison.InvariantCultureIgnoreCase))
        //        return "Product";
        //    else
        //        return "Order";
        //}

        //private DC.DiscountTarget MapToDiscountTarget(Discount d)
        //{
        //    string targetType;
        //    switch (d.TargetType.ToLowerInvariant())
        //    {
        //        case "allproducts":
        //        case "product":
        //            targetType = "Product";
        //            break;
        //        default:
        //            targetType = d.AmountType.Equals("FreeShipping", StringComparison.InvariantCultureIgnoreCase) ? "FreeShipping" : "Order";
        //            break;
        //    }


        //    return new DC.DiscountTarget
        //        {
        //            Categories = (d.Categories ?? new List<int>()).Select(targetedCategory => new DC.TargetedCategory { Id = targetedCategory }).ToList(),
        //            Products = (d.Products ?? new List<string>()).Select(targetedProduct => new DC.TargetedProduct { Code = targetedProduct }).ToList(),
        //            ShippingMethods = (d.ShippingMethods ?? new List<string>()).Select(targetedShippingMethods => new DC.TargetedShippingMethod { Code = targetedShippingMethods }).ToList(),
        //            IncludeAllProducts = d.TargetType.Equals("allproducts", StringComparison.InvariantCultureIgnoreCase),
        //            MinimumOrderAmount = d.MinimumOrderAmount,
        //            Type = targetType
        //        };

        //}
    }
}