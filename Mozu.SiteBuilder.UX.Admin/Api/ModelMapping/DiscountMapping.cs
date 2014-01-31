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
                  .ForMember(x => x.TargetType, opt => opt.ResolveUsing(x=> (x.Target != null) ? x.Target.Type : null))
                  .ForMember(x => x.IncludeAllProducts, opt => opt.ResolveUsing(x=> (x.Target != null) 
                      ? x.Target.IncludeAllProducts : null))
                  .ForMember(x => x.MinimumLifetimeValueAmount, opt => opt.ResolveUsing(x => (x.Conditions != null) 
                      ? x.Conditions.MinimumLifetimeValueAmount : null))
                  .ForMember(x => x.Categories, opt => opt.ResolveUsing(x=> (x.Target != null && x.Target.Categories != null)
                      ? (x.Target.Categories).Select(_ => _.Id).ToList()
                      : (Enumerable.Empty<DC.TargetedCategory>()).Select( _=> _.Id ).ToList()  ))
                  .ForMember(x => x.Products, opt => opt.ResolveUsing(x=> (x.Target != null && x.Target.Products != null)
                      ? (x.Target.Products).Select(_ => _.ProductCode).ToList()
                      : (Enumerable.Empty<DC.TargetedProduct>()).Select( _=> _.ProductCode ).ToList()  ))
                  .ForMember(x => x.ExcludedCategories, opt => opt.ResolveUsing(x =>
                      (x.Target != null && x.Target.ExcludedCategories != null)
                      ? (x.Target.ExcludedCategories).Select(_ => _.Id).ToList()
                      : (Enumerable.Empty<DC.TargetedCategory>()).Select(_ => _.Id).ToList()))
                  .ForMember(x => x.ExcludedProducts, opt => opt.ResolveUsing(x => (x.Target != null && x.Target.ExcludedProducts != null)
                      ? (x.Target.ExcludedProducts).Select(_ => _.ProductCode).ToList()
                      : (Enumerable.Empty<DC.TargetedProduct>()).Select(_ => _.ProductCode).ToList()))
                  .ForMember(x => x.ShippingMethods, opt => opt.ResolveUsing(x => (x.Target != null && x.Target.ShippingMethods != null)
                      ? (x.Target.ShippingMethods).Select(_ => _.Code).ToList()
                      : (Enumerable.Empty<DC.TargetedShippingMethod>()).Select(_ => _.Code).ToList()))
                  .ForMember(x => x.MinimumOrderAmount, opt => opt.ResolveUsing(x => (x.Conditions != null) 
                      ? x.Conditions.MinimumOrderAmount : null))
                  .ForMember(x => x.MaxRedemptionCount, opt => opt.ResolveUsing(x => (x.Conditions != null) 
                      ? x.Conditions.MaxRedemptionCount : null))
                  .ForMember(x => x.StartDate, opt => opt.ResolveUsing(x => (x.Conditions != null) 
                      ? x.Conditions.StartDate : null))
                  .ForMember(x => x.ExpirationDate, opt => opt.ResolveUsing(x => (x.Conditions != null) 
                      ? x.Conditions.ExpirationDate : null))
                  //todo: confirm false as default Greg Murray on 2014-01-27 
                  .ForMember(x => x.RequiresCoupon, opt => opt.ResolveUsing(x => (x.Conditions != null) ? x.Conditions.RequiresCoupon : false))
                  .ForMember(x => x.CouponCode, opt => opt.ResolveUsing(x => (x.Conditions != null) 
                      ? x.Conditions.CouponCode : null))
                  .ForMember(x => x.DiscountConditionCategories, opt => opt.ResolveUsing(x => ( (x.Conditions ?? new DC.DiscountCondition())
                      .IncludedCategories ?? Enumerable.Empty<DC.CategoryDiscountCondition>())
                      .Select(_ => _.CategoryId ).ToList()))
                  .ForMember(x => x.DiscountConditionProducts, opt => opt.ResolveUsing(x => ((x.Conditions ?? new DC.DiscountCondition())
                      .IncludedProducts  ?? Enumerable.Empty<DC.ProductDiscountCondition >())
                      .Select(_ => _.ProductCode).ToList()))
                  .ForMember(x => x.DiscountConditionExcludedCategories, opt => opt.ResolveUsing(x => ((x.Conditions ?? new DC.DiscountCondition())
                      .ExcludedCategories ?? Enumerable.Empty<DC.CategoryDiscountCondition>())
                      .Select(_ => _.CategoryId).ToList()))
                  .ForMember(x => x.DiscountConditionExcludedProducts, opt => opt.ResolveUsing(x => ((x.Conditions ?? new DC.DiscountCondition())
                      .ExcludedProducts ?? Enumerable.Empty<DC.ProductDiscountCondition>())
                      .Select(_ => _.ProductCode).ToList()))
                  .ForMember(x => x.Name , op => op.ResolveUsing(dc => dc.Content.Name ));

            // To data contract
            Mapper.CreateMap<Discount, DC.Discount>()
                  .ForMember(x => x.Content, opt => opt.ResolveUsing(x => new DC.DiscountLocalizedContent() {Name = x.Name}))
                  .ForMember(x => x.Conditions , opt => opt.ResolveUsing(x => new DC.DiscountCondition() 
                                                                        {
                                                                            IncludedCategories = (x.DiscountConditionCategories ?? Enumerable.Empty<int>()).Select(_ => new DC.CategoryDiscountCondition() { CategoryId  = _ }).ToList(),
                                                                            ExcludedCategories = (x.DiscountConditionExcludedCategories  ?? Enumerable.Empty<int>()).Select(_ => new DC.CategoryDiscountCondition() { CategoryId = _ }).ToList(),
                                                                            IncludedProducts = (x.DiscountConditionProducts ?? Enumerable.Empty<string>()).Select(_ => new DC.ProductDiscountCondition() { ProductCode = _ }).ToList(),
                                                                            ExcludedProducts = (x.DiscountConditionExcludedProducts  ?? Enumerable.Empty<string>()).Select(_ => new DC.ProductDiscountCondition() { ProductCode  = _ }).ToList(),
                                                                            MinimumOrderAmount = x.MinimumOrderAmount ==0  ? null : x.MinimumOrderAmount,
                                                                            MinimumLifetimeValueAmount = x.MinimumLifetimeValueAmount == 0 ? null : x.MinimumLifetimeValueAmount,
                                                                            MaxRedemptionCount = x.MaxRedemptionCount,
                                                                            StartDate = x.StartDate,
                                                                            ExpirationDate = x.ExpirationDate,
                                                                            RequiresCoupon = x.RequiresCoupon,
                                                                            CouponCode = x.CouponCode
                                                                        }))
                  .ForMember(x => x.Target, opt => opt.ResolveUsing(x => new DC.DiscountTarget()
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
                      })
                 .ForMember(dc => dc.AuditInfo, opt => opt.Ignore())
                      ;


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