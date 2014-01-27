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
                  .ForMember(x => x.MinimumLifetimeValueAmount, opt => opt.MapFrom(x => x.Conditions.MinimumLifetimeValueAmount))
                  .ForMember(x => x.Categories    , opt => opt.MapFrom(x=> (x.Target.Categories ?? Enumerable.Empty<DC.TargetedCategory>()).Select( _=> _.Id ).ToList()  ))
                  .ForMember(x => x.Products     , opt => opt.MapFrom(x=> (x.Target.Products  ?? Enumerable.Empty<DC.TargetedProduct >()).Select( _=> _.ProductCode   ).ToList()  ))
                  .ForMember(x => x.ExcludedCategories, opt => opt.MapFrom(x => (x.Target.ExcludedCategories ?? Enumerable.Empty<DC.TargetedCategory>()).Select(_ => _.Id).ToList()))
                  .ForMember(x => x.ExcludedProducts, opt => opt.MapFrom(x => (x.Target.ExcludedProducts ?? Enumerable.Empty<DC.TargetedProduct>()).Select(_ => _.ProductCode ).ToList()))
                  .ForMember(x => x.ShippingMethods, opt => opt.MapFrom(x => (x.Target.ShippingMethods ?? Enumerable.Empty<DC.TargetedShippingMethod>()).Select(_ => _.Code).ToList()))
                  
                  //setting min amount to null if zero .. 0 triggers the discount only to work in cart/order.
                  .ForMember(x => x.MinimumOrderAmount, opt => opt.ResolveUsing(x => (x.Conditions.MinimumOrderAmount.HasValue && x.Conditions.MinimumOrderAmount.Value > 0) ? x.Conditions.MinimumOrderAmount: null ))
                  .ForMember(x => x.MaxRedemptionCount, opt => opt.MapFrom(x => x.Conditions.MaxRedemptionCount))
                  .ForMember(x => x.StartDate, opt => opt.MapFrom(x => x.Conditions.StartDate))
                  .ForMember(x => x.ExpirationDate, opt => opt.MapFrom(x => x.Conditions.ExpirationDate))
                  .ForMember(x => x.RequiresCoupon, opt => opt.MapFrom(x => x.Conditions.RequiresCoupon))
                  .ForMember(x => x.CouponCode, opt => opt.MapFrom(x => x.Conditions.CouponCode))




                  .ForMember(x => x.DiscountConditionCategories, opt => opt.MapFrom(x => ( (x.Conditions?? new DC.DiscountCondition()).IncludedCategories ?? Enumerable.Empty<DC.CategoryDiscountCondition>()) .Select(_ => _.CategoryId ).ToList()))
                  .ForMember(x => x.DiscountConditionProducts, opt => opt.MapFrom(x => ((x.Conditions ?? new DC.DiscountCondition()).IncludedProducts  ?? Enumerable.Empty<DC.ProductDiscountCondition >()).Select(_ => _.ProductCode).ToList()))
                  .ForMember(x => x.DiscountConditionExcludedCategories, opt => opt.MapFrom(x => ((x.Conditions ?? new DC.DiscountCondition()).ExcludedCategories ?? Enumerable.Empty<DC.CategoryDiscountCondition>()).Select(_ => _.CategoryId).ToList()))
                  .ForMember(x => x.DiscountConditionExcludedProducts, opt => opt.MapFrom(x => ((x.Conditions ?? new DC.DiscountCondition()).ExcludedProducts ?? Enumerable.Empty<DC.ProductDiscountCondition>()).Select(_ => _.ProductCode).ToList()))
                  


                  .ForMember(x => x.Name , op => op.ResolveUsing(dc => dc.Content.Name ));

            // To data contract
            Mapper.CreateMap<Discount, DC.Discount>()
                  .ForMember(x => x.Content, opt => opt.MapFrom(x => new DC.DiscountLocalizedContent() {Name = x.Name}))
                  .ForMember(x => x.Conditions , opt => opt.MapFrom(x => new DC.DiscountCondition() 
                                                                        {
                                                                            IncludedCategories = (x.DiscountConditionCategories ?? Enumerable.Empty<int>()).Select(_ => new DC.CategoryDiscountCondition() { CategoryId  = _ }).ToList(),
                                                                            ExcludedCategories = (x.DiscountConditionExcludedCategories  ?? Enumerable.Empty<int>()).Select(_ => new DC.CategoryDiscountCondition() { CategoryId = _ }).ToList(),
                                                                            IncludedProducts = (x.DiscountConditionProducts ?? Enumerable.Empty<string>()).Select(_ => new DC.ProductDiscountCondition() { ProductCode = _ }).ToList(),
                                                                            ExcludedProducts = (x.DiscountConditionExcludedProducts  ?? Enumerable.Empty<string>()).Select(_ => new DC.ProductDiscountCondition() { ProductCode  = _ }).ToList(),
                                                                            MinimumOrderAmount = x.MinimumOrderAmount,
                                                                            MinimumLifetimeValueAmount = x.MinimumLifetimeValueAmount,
                                                                            MaxRedemptionCount = x.MaxRedemptionCount,
                                                                            StartDate = x.StartDate,
                                                                            ExpirationDate = x.ExpirationDate,
                                                                            RequiresCoupon = x.RequiresCoupon,
                                                                            CouponCode = x.CouponCode
                                                                        }))
                  .ForMember(x => x.Target, opt => opt.MapFrom(x => new DC.DiscountTarget()
                                                                        {
                                                                            Type = x.TargetType,
                                                                            Categories = (x.Categories ?? Enumerable.Empty<int>()).Select(_ => new DC.TargetedCategory() {Id = _}).ToList(),
                                                                            ExcludedCategories  = (x.ExcludedCategories  ?? Enumerable.Empty<int>()).Select(_ => new DC.TargetedCategory()  { Id = _ }).ToList(),
                                                                            ExcludedProducts = (x.ExcludedProducts ?? Enumerable.Empty<string>()).Select(_ => new DC.TargetedProduct() { ProductCode = _ }).ToList(),
                                                                            Products = (x.Products ?? Enumerable.Empty<string>()).Select(_ => new DC.TargetedProduct() {ProductCode  = _}).ToList(),
                                                                            ShippingMethods = (x.ShippingMethods ?? Enumerable.Empty<string>()).Select(_ => new DC.TargetedShippingMethod() {Code = _}).ToList(),
                                                                           IncludeAllProducts = x.IncludeAllProducts,
                                                                        }))
                  .AfterMap((s, d) =>
                      {
                          if (d.Target.IncludeAllProducts.GetValueOrDefault( false ))
                          {
                              d.Target.Products = null;
                              d.Target.Categories = null;
                              //d.Target.ExcludedCategories = null;
                              //d.Target.ExcludedProducts = null;
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