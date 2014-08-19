using System.Linq;
using AutoMapper;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Discount;
using DC = Mozu.ProductAdmin.Contracts;
using System.Collections.Generic;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{

    #region sort field mapping

    public interface IDiscountSortFormatter : ISortFormatter
    {
    }

    /// <summary>
    ///     Provides mapping to API fields for sorting and formatting to API sort syntax.
    ///     Keeps mapping in one place by colocating with mapping.
    /// </summary>
    public class DiscountSortFormatter : IDiscountSortFormatter
    {
        public string Format(SortingCollectionItem sortItem)
        {
            if (sortItem == null || string.IsNullOrEmpty(sortItem.property))
                return string.Empty;
            switch (sortItem.property.ToLowerInvariant())
            {
                case "name":
                    return "content.name" + GetSortDirection(sortItem);
                case "expirationdate":
                    return "enddate" + GetSortDirection(sortItem);
                case "amounttype":
                    return "amounttype" + GetSortDirection(sortItem) + ", amount" + GetSortDirection(sortItem);
                default:
                    return sortItem.property.ToLowerInvariant() + GetSortDirection(sortItem);
            }
        }

        private static string GetSortDirection(SortingCollectionItem sortItem)
        {
            return ((sortItem.IsAscending) ? " asc" : " desc");
        }
    }

    #endregion

    public class DiscountMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            // To model
            Mapper.CreateMap<DC.Discount, Discount>()
                .ForMember(x => x.Target, opt => opt.ResolveUsing(x => (x.Target != null) ? x.Target.Type : null))
                .ForMember(x => x.IncludeAllProducts, opt => opt.ResolveUsing(x => (x.Target != null)
                    ? x.Target.IncludeAllProducts : null))
                .ForMember(x => x.MinimumLifetimeValueAmount, opt => opt.ResolveUsing(x => (x.Conditions != null)
                    ? x.Conditions.MinimumLifetimeValueAmount : null))
                .ForMember(x => x.MaximumQuantityPerRedemption, opt => opt.ResolveUsing(x => (x.Target != null)
                                    ? x.Target.MaximumQuantityPerRedemption : null))


                .ForMember(x => x.Categories, opt => opt.ResolveUsing(x => (x.Target != null && x.Target.Categories != null)
                    ? (x.Target.Categories).Select(_ => _.Id).ToList()
                    : (Enumerable.Empty<DC.TargetedCategory>()).Select(_ => _.Id).ToList()))
                .ForMember(x => x.Products, opt => opt.ResolveUsing(x => (x.Target != null && x.Target.Products != null)
                    ? (x.Target.Products).Select(_ => _.ProductCode).ToList()
                    : (Enumerable.Empty<DC.TargetedProduct>()).Select(_ => _.ProductCode).ToList()))
                .ForMember(x => x.ExcludedCategories, opt => opt.ResolveUsing(x =>
                    (x.Target != null && x.Target.ExcludedCategories != null)
                        ? (x.Target.ExcludedCategories).Select(_ => _.Id).ToList()
                        : (Enumerable.Empty<DC.TargetedCategory>()).Select(_ => _.Id).ToList()))
                .ForMember(x => x.ExcludedProducts, opt => opt.ResolveUsing(x => (x.Target != null && x.Target.ExcludedProducts != null)
                    ? (x.Target.ExcludedProducts).Select(_ => _.ProductCode).ToList()
                    : (Enumerable.Empty<DC.TargetedProduct>()).Select(_ => _.ProductCode).ToList()))

                .ForMember(x => x.ShippingMethods, opt => opt.ResolveUsing(x => (x.Target != null && x.Target.ShippingMethods != null)
                    ? ((x.Target.ShippingMethods).Select(_ => _.Code).ToList())
                    : new List<string>()))

               .ForMember(x => x.ShippingZones, opt => opt.ResolveUsing(x => (x.Target != null && x.Target.ShippingZones != null)
                    ? ((x.Target.ShippingZones).Select(_ => _.Zone).ToList())
                    : new List<string>()))

               //.ForMember(x => x.ShippingZones , opt => opt.ResolveUsing( x =>   (x.Target != null && x.Target.ShippingZones  != null)
                //     ? x.Target.ShippingZones.Select(_ => __.z).ToList()
                //     : new List<string>()))


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
                .ForMember(x => x.DiscountConditionCategories, opt => opt.ResolveUsing(x => ((x.Conditions ?? new DC.DiscountCondition())
                    .IncludedCategories ?? Enumerable.Empty<DC.CategoryDiscountCondition>())
                    .Select(_ => _.CategoryId).ToList()))
                .ForMember(x => x.MinimumQuantityProductsRequiredInCategories, opt => opt.ResolveUsing(x => (x.Conditions != null)
                    ? x.Conditions.MinimumQuantityProductsRequiredInCategories : null))
                .ForMember(x => x.MinimumQuantityRequiredProducts, opt => opt.ResolveUsing(x => (x.Conditions != null)
                    ? x.Conditions.MinimumQuantityRequiredProducts : null))
                .ForMember(x => x.MinimumCategorySubtotalBeforeDiscounts, opt => opt.ResolveUsing(x => (x.Conditions != null)
                    ? x.Conditions.MinimumCategorySubtotalBeforeDiscounts : null))
                .ForMember(x => x.DiscountConditionProducts, opt => opt.ResolveUsing(x => ((x.Conditions ?? new DC.DiscountCondition())
                    .IncludedProducts ?? Enumerable.Empty<DC.ProductDiscountCondition>())
                    .Select(_ => _.ProductCode).ToList()))
                .ForMember(x => x.DiscountConditionExcludedCategories, opt => opt.ResolveUsing(x => ((x.Conditions ?? new DC.DiscountCondition())
                    .ExcludedCategories ?? Enumerable.Empty<DC.CategoryDiscountCondition>())
                    .Select(_ => _.CategoryId).ToList()))
                .ForMember(x => x.DiscountConditionExcludedProducts, opt => opt.ResolveUsing(x => ((x.Conditions ?? new DC.DiscountCondition())
                    .ExcludedProducts ?? Enumerable.Empty<DC.ProductDiscountCondition>())
                    .Select(_ => _.ProductCode).ToList()))
                .ForMember(x => x.CustomerSegments, opt => opt.ResolveUsing(x => ((x.Conditions ?? new DC.DiscountCondition())
                    .CustomerSegments ?? Enumerable.Empty<DC.CustomerSegment>())
                    .Select(_ => _.Id).ToList()))
                .ForMember(x => x.Amount, op => op.ResolveUsing(dc => (dc.AmountType == null || dc.AmountType.EqualsIgnoreCase(DC.Discount.AmountTypes.FREE))
                    ? null
                    : dc.Amount))
                .ForMember(x => x.DoesNotApplyToSalePrice, op => op.ResolveUsing(dc => dc.DoesNotApplyToSalePrice))
                .ForMember(x => x.Name, op => op.ResolveUsing(dc => dc.Content.Name))
                .ForMember(x => x.FriendlyDescription, op => op.ResolveUsing(dc => dc.Content.FriendlyDescription));
                
            // To data contract
            Mapper.CreateMap<Discount, DC.Discount>()
                .ForMember(x => x.DoesNotApplyToSalePrice, opt => opt.ResolveUsing(x => x.DoesNotApplyToSalePrice))
                .ForMember(dc => dc.Amount, op => op.ResolveUsing(x => (x.AmountType == null || x.AmountType.EqualsIgnoreCase(DC.Discount.AmountTypes.FREE))
                    ? null
                    : x.Amount))
                .ForMember(x => x.Content, opt => opt.ResolveUsing(x => new DC.DiscountLocalizedContent {Name = x.Name, FriendlyDescription = x.FriendlyDescription}))
                .ForMember(x => x.Conditions, opt => opt.ResolveUsing(x => new DC.DiscountCondition
                                                                           {
                                                                               IncludedCategories = (x.DiscountConditionCategories ?? Enumerable.Empty<int>()).Select(_ => new DC.CategoryDiscountCondition {CategoryId = _}).ToList(),
                                                                               ExcludedCategories = (x.DiscountConditionExcludedCategories ?? Enumerable.Empty<int>()).Select(_ => new DC.CategoryDiscountCondition {CategoryId = _}).ToList(),
                                                                               IncludedProducts = (x.DiscountConditionProducts ?? Enumerable.Empty<string>()).Select(_ => new DC.ProductDiscountCondition {ProductCode = _}).ToList(),
                                                                               ExcludedProducts = (x.DiscountConditionExcludedProducts ?? Enumerable.Empty<string>()).Select(_ => new DC.ProductDiscountCondition {ProductCode = _}).ToList(),
                                                                               CustomerSegments = (x.CustomerSegments ?? Enumerable.Empty<int>()).Select(_ => new DC.CustomerSegment {Id = _}).ToList(),
                                                                               MinimumQuantityProductsRequiredInCategories = x.MinimumQuantityProductsRequiredInCategories,
                                                                               MinimumQuantityRequiredProducts = x.MinimumQuantityRequiredProducts,
                                                                               MinimumCategorySubtotalBeforeDiscounts = x.MinimumCategorySubtotalBeforeDiscounts,
                                                                               MinimumOrderAmount = x.MinimumOrderAmount == 0 ? null : x.MinimumOrderAmount,
                                                                               MinimumLifetimeValueAmount = x.MinimumLifetimeValueAmount == 0 ? null : x.MinimumLifetimeValueAmount,
                                                                               MaxRedemptionCount = x.MaxRedemptionCount,
                                                                               StartDate = x.StartDate,
                                                                               ExpirationDate = x.ExpirationDate,
                                                                               RequiresCoupon = x.RequiresCoupon,
                                                                               CouponCode = x.CouponCode
                                                                           }))
                .ForMember(x => x.Target, opt => opt.ResolveUsing(x => new DC.DiscountTarget
                                                                       {
                                                                           Type = x.Target,
                                                                           MaximumQuantityPerRedemption = x.MaximumQuantityPerRedemption ,
                                                                           Categories = (x.Categories ?? Enumerable.Empty<int>()).Select(_ => new DC.TargetedCategory {Id = _}).ToList(),
                                                                           ExcludedCategories = (x.ExcludedCategories ?? Enumerable.Empty<int>()).Select(_ => new DC.TargetedCategory {Id = _}).ToList(),
                                                                           ExcludedProducts = (x.ExcludedProducts ?? Enumerable.Empty<string>()).Select(_ => new DC.TargetedProduct {ProductCode = _}).ToList(),
                                                                           Products = (x.Products ?? Enumerable.Empty<string>()).Select(_ => new DC.TargetedProduct {ProductCode = _}).ToList(),
                                                                           ShippingMethods = (x.ShippingMethods ?? Enumerable.Empty<string>()).Select(_ => new DC.TargetedShippingMethod { Code = _ }).ToList(),
                                                                          ShippingZones = (x.ShippingZones ?? Enumerable.Empty<string>()).Select(_ => new DC.TargetedShippingZone()  { Zone  = _ }).ToList(),
                                                                           IncludeAllProducts = x.IncludeAllProducts,
                                                                       }))
                .AfterMap((s, d) =>
                {
                    if (d.Target.IncludeAllProducts.GetValueOrDefault(false))
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
        //    switch (d.Target.ToLowerInvariant())
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
        //            IncludeAllProducts = d.Target.Equals("allproducts", StringComparison.InvariantCultureIgnoreCase),
        //            MinimumOrderAmount = d.MinimumOrderAmount,
        //            Type = targetType
        //        };

        //}
    }
}