using System;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
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
            if (string.IsNullOrEmpty(sortItem?.property))
                return string.Empty;
            switch (sortItem.property.ToLowerInvariant())
            {
                case "name":
                    return "content.name" + GetSortDirection(sortItem);
                case "expirationdate":
                    return "enddate" + GetSortDirection(sortItem);
                case "amounttype":
                    return "amounttype" + GetSortDirection(sortItem) + ", amount" + GetSortDirection(sortItem);
                case "lastmodifieddate":
                    return "updatedate" + GetSortDirection(sortItem);
                default:
                    return sortItem.property.ToLowerInvariant() + GetSortDirection(sortItem);
            }
        }

        private static string GetSortDirection(SortingCollectionItem sortItem)
        {
            return ((sortItem.IsAscending) ? " asc" : " desc");
        }
    }

    #region CouponSet sorter

    #region sort field mapping

    public interface ICouponSetSortFormatter : ISortFormatter
    {
    }

    /// <summary>
    ///     Provides mapping to API fields for sorting and formatting to API sort syntax.
    ///     Keeps mapping in one place by colocating with mapping.
    /// </summary>
    public class CouponSetSortFormatter : ICouponSetSortFormatter
    {
        public string Format(SortingCollectionItem sortItem)
        {
            if (sortItem == null || string.IsNullOrEmpty(sortItem.property))
                return string.Empty;
            return sortItem.property.ToLowerInvariant() + GetSortDirection(sortItem);
        }

        private static string GetSortDirection(SortingCollectionItem sortItem)
        {
            return ((sortItem.IsAscending) ? " asc" : " desc");
        }
    }

    #endregion
    #endregion

    #endregion

    public class DiscountMapping : Profile
    {
        public DiscountMapping()
        {
            // To model
            CreateMap<DC.Discount, Discount>()
                .ForMember(x => x.Target, opt => opt.ResolveUsing(x => x.Target?.Type))
                .ForMember(x => x.IncludeAllProducts, opt => opt.ResolveUsing(x => x.Target?.IncludeAllProducts))

                .ForMember(x => x.IncludedPaymentType, opt => opt.ResolveUsing(x =>
                    (x.Conditions != null && !x.Conditions.IncludedPaymentWorkflows.IsNullOrEmpty())
                        ? x.Conditions.IncludedPaymentWorkflows.First()
                        : null))

                .ForMember(x => x.ExcludeItemsWithExistingProductDiscounts,
                    opt => opt.ResolveUsing(x => x.Target?.ExcludeItemsWithExistingProductDiscounts))

                .ForMember(x => x.AppliesToLeastExpensiveProductsFirst,
                    opt => opt.ResolveUsing(x => x.Target?.AppliesToLeastExpensiveProductsFirst))

                .ForMember(x => x.ExcludeItemsWithExistingShippingDiscounts,
                    opt => opt.ResolveUsing(x => x.Target?.ExcludeItemsWithExistingShippingDiscounts))

                .ForMember(x => x.MinimumLifetimeValueAmount,
                    opt => opt.ResolveUsing(x => x.Conditions?.MinimumLifetimeValueAmount))
                .ForMember(x => x.MaximumQuantityPerRedemption,
                    opt => opt.ResolveUsing(x => x.Target?.MaximumQuantityPerRedemption))
                .ForMember(x => x.Categories,
                    opt => opt.ResolveUsing(x => x.Target?.Categories?.Select(_ => _.Id).ToList() 
                        ?? (Enumerable.Empty<DC.TargetedCategory>()).Select(_ => _.Id).ToList()))
                .ForMember(x => x.IsIncludedCategoriesAllOperator, 
                    op => op.ResolveUsing(dc => (dc.Target != null 
                        && dc.Target.IncludedCategoriesOperator == DC.DiscountTarget.TargetedCategoriesOperators.ALL)))
                .ForMember(x => x.Products, opt => opt.ResolveUsing(x =>
                    x.Target?.Products?.Select(_ => _.ProductCode).ToList() ?? (Enumerable.Empty<DC.TargetedProduct>())
                    .Select(_ => _.ProductCode).ToList()))
                .ForMember(x => x.ExcludedCategories, opt => opt.ResolveUsing(x =>
                    x.Target?.ExcludedCategories?.Select(_ => _.Id).ToList() ??
                    (Enumerable.Empty<DC.TargetedCategory>()).Select(_ => _.Id).ToList()))
                .ForMember(x => x.ExcludedProducts,
                    opt => opt.ResolveUsing(x =>
                        x.Target?.ExcludedProducts?.Select(_ => _.ProductCode).ToList() ??
                        (Enumerable.Empty<DC.TargetedProduct>()).Select(_ => _.ProductCode).ToList()))

                .ForMember(dest => dest.ProductsToExcludeFromMinOrderTotal,
                    opt => opt.ResolveUsing(src => src.Conditions?.ProductsToExcludeFromMinOrderTotal?
                        .Select(condition => condition.ProductCode).ToList() ?? Enumerable.Empty<string>()))

                .ForMember(dest => dest.CategoriesToExcludeFromMinOrderTotal,
                    opt => opt.ResolveUsing(src => src.Conditions?.CategoriesToExcludeFromMinOrderTotal?
                        .Select(condition => condition.CategoryId).ToList() ?? Enumerable.Empty<int>()))

                .ForMember(x => x.IncludedPriceLists, op => op.ResolveUsing(dc => dc.IncludedPriceLists))


                .ForMember(x => x.ShippingMethods,
                    opt => opt.ResolveUsing(x =>
                        x.Target?.ShippingMethods?.Select(_ => _.Code).ToList() ?? new List<string>()))

                .ForMember(x => x.ShippingZones,
                    opt => opt.ResolveUsing(x =>
                        x.Target?.ShippingZones?.Select(_ => _.Zone).ToList() ?? new List<string>()))

                //.ForMember(x => x.ShippingZones , opt => opt.ResolveUsing( x =>   (x.Target != null && x.Target.ShippingZones  != null)
                //     ? x.Target.ShippingZones.Select(_ => __.z).ToList()
                //     : new List<string>()))


                .ForMember(x => x.MinimumOrderAmount, opt => opt.ResolveUsing(x => x.Conditions?.MinimumOrderAmount))
                .ForMember(x => x.MaxRedemptionCount, opt => opt.ResolveUsing(x => x.Conditions?.MaxRedemptionCount))
                .ForMember(x => x.MaximumRedemptionsPerOrder, opt => opt.ResolveUsing(dc => (dc.Conditions != null)
                    ? dc.MaximumRedemptionsPerOrder
                    : null))
                .ForMember(x => x.StartDate, opt => opt.ResolveUsing(x => x.Conditions?.StartDate))
                .ForMember(x => x.ExpirationDate, opt => opt.ResolveUsing(x => x.Conditions?.ExpirationDate))
                //todo: confirm false as default Greg Murray on 2014-01-27 
                .ForMember(x => x.RequiresCoupon,
                    opt => opt.ResolveUsing(x => (x.Conditions != null) && x.Conditions.RequiresCoupon))
                .ForMember(x => x.CouponCode, opt => opt.ResolveUsing(x => x.Conditions?.CouponCode))
                .ForMember(x => x.DiscountConditionCategories,
                    opt => opt.ResolveUsing(x => ((x.Conditions ?? new DC.DiscountCondition())
                                                  .IncludedCategories ??
                                                  Enumerable.Empty<DC.CategoryDiscountCondition>())
                        .Select(_ => _.CategoryId).ToList()))
                .ForMember(x => x.MinimumQuantityProductsRequiredInCategories,
                    opt => opt.ResolveUsing(x => x.Conditions?.MinimumQuantityProductsRequiredInCategories))
                .ForMember(x => x.MinimumQuantityRequiredProducts,
                    opt => opt.ResolveUsing(x => x.Conditions?.MinimumQuantityRequiredProducts))
                .ForMember(x => x.MinimumCategorySubtotalBeforeDiscounts,
                    opt => opt.ResolveUsing(x => x.Conditions?.MinimumCategorySubtotalBeforeDiscounts))
                .ForMember(x => x.DiscountConditionProducts,
                    opt => opt.ResolveUsing(x => ((x.Conditions ?? new DC.DiscountCondition())
                                                  .IncludedProducts ?? Enumerable.Empty<DC.ProductDiscountCondition>())
                        .Select(_ => _.ProductCode).ToList()))
                .ForMember(x => x.DiscountConditionExcludedCategories,
                    opt => opt.ResolveUsing(x => ((x.Conditions ?? new DC.DiscountCondition())
                                                  .ExcludedCategories ??
                                                  Enumerable.Empty<DC.CategoryDiscountCondition>())
                        .Select(_ => _.CategoryId).ToList()))
                .ForMember(x => x.DiscountConditionExcludedProducts,
                    opt => opt.ResolveUsing(x => ((x.Conditions ?? new DC.DiscountCondition())
                                                  .ExcludedProducts ?? Enumerable.Empty<DC.ProductDiscountCondition>())
                        .Select(_ => _.ProductCode).ToList()))
                .ForMember(x => x.CustomerSegments,
                    opt => opt.ResolveUsing(x => ((x.Conditions ?? new DC.DiscountCondition())
                                                  .CustomerSegments ?? Enumerable.Empty<DC.CustomerSegment>())
                        .Select(_ => _.Id).ToList()))
                .ForMember(x => x.Amount,
                    op =>
                        op.ResolveUsing(
                            dc =>
                                (dc.AmountType == null || dc.AmountType.EqualsIgnoreCase(DC.Discount.AmountTypes.FREE))
                                    ? null
                                    : dc.Amount))
                .ForMember(x => x.DoesNotApplyToSalePrice, op => op.ResolveUsing(dc => dc.DoesNotApplyToSalePrice))
                .ForMember(x => x.DoesNotApplyToProductsWithSalePrice,
                    op => op.ResolveUsing(dc => dc.DoesNotApplyToProductsWithSalePrice))
                .ForMember(x => x.Name,
                    op => op.ResolveUsing(dc => dc.Content != null ? dc.Content.Name : string.Empty))
                .ForMember(x => x.FriendlyDescription,
                    op => op.ResolveUsing(dc => dc.Content != null ? dc.Content.FriendlyDescription : string.Empty))
                .ForMember(x => x.CouponSets, op => op.Ignore())
                .ForMember(x => x.CanBeStackedUpon, op => op.ResolveUsing(dc => dc.CanBeStackedUpon))
                .ForMember(x => x.StackingLayer, op => op.ResolveUsing(dc => dc.StackingLayer))
                .ForMember(x => x.ThresholdMessage, op => op.ResolveUsing(dc => dc.ThresholdMessage))
                //AuditInfo
                .ForMember(x => x.CreateBy, op => op.ResolveUsing(dc => dc.AuditInfo?.CreateBy))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => dc.AuditInfo?.CreateDate))
                .ForMember(x => x.LastModifiedBy, op => op.ResolveUsing(dc => dc.AuditInfo?.UpdateBy))
                .ForMember(x => x.LastModifiedDate, op => op.ResolveUsing(dc => dc.AuditInfo?.UpdateDate));

            // To data contract
            CreateMap<Discount, DC.Discount>()
                .ForMember(dc => dc.CanBeStackedUpon, op => op.ResolveUsing(x => x.CanBeStackedUpon))
                .ForMember(dc => dc.StackingLayer, op => op.ResolveUsing(x => x.StackingLayer))
                .ForMember(dc => dc.ThresholdMessage, op => op.ResolveUsing(x => x.ThresholdMessage))
                .ForMember(dc => dc.DoesNotApplyToSalePrice, opt => opt.ResolveUsing(x => x.DoesNotApplyToSalePrice))
                .ForMember(dc => dc.DoesNotApplyToProductsWithSalePrice,
                    opt => opt.ResolveUsing(x => x.DoesNotApplyToProductsWithSalePrice))
                .ForMember(dc => dc.Amount, op => op.ResolveUsing(x =>
                    (x.AmountType == null || x.AmountType.EqualsIgnoreCase(DC.Discount.AmountTypes.FREE))
                        ? null
                        : x.Amount))
                .ForMember(dc => dc.Content,
                    opt => opt.ResolveUsing(x =>
                        new DC.DiscountLocalizedContent {Name = x.Name, FriendlyDescription = x.FriendlyDescription}))
                .ForMember(dc => dc.Conditions, opt => opt.ResolveUsing(x => new DC.DiscountCondition
                {
                    IncludedCategories = (x.DiscountConditionCategories ?? Enumerable.Empty<int>())
                        .Select(_ => new DC.CategoryDiscountCondition {CategoryId = _}).ToList(),
                    ExcludedCategories = (x.DiscountConditionExcludedCategories ?? Enumerable.Empty<int>())
                        .Select(_ => new DC.CategoryDiscountCondition {CategoryId = _}).ToList(),
                    CategoriesToExcludeFromMinOrderTotal =
                        (x.CategoriesToExcludeFromMinOrderTotal ?? Enumerable.Empty<int>())
                        .Select(_ => new DC.CategoryDiscountCondition {CategoryId = _}).ToList(),
                    IncludedProducts = (x.DiscountConditionProducts ?? Enumerable.Empty<string>())
                        .Select(_ => new DC.ProductDiscountCondition {ProductCode = _}).ToList(),
                    ExcludedProducts = (x.DiscountConditionExcludedProducts ?? Enumerable.Empty<string>())
                        .Select(_ => new DC.ProductDiscountCondition {ProductCode = _}).ToList(),
                    ProductsToExcludeFromMinOrderTotal =
                        (x.ProductsToExcludeFromMinOrderTotal ?? Enumerable.Empty<string>())
                        .Select(_ => new DC.ProductDiscountCondition {ProductCode = _}).ToList(),
                    IncludedPaymentWorkflows = (string.IsNullOrEmpty(x.IncludedPaymentType))
                        ? null
                        : new List<string> {x.IncludedPaymentType},
                    CustomerSegments = (x.CustomerSegments ?? Enumerable.Empty<int>())
                        .Select(_ => new DC.CustomerSegment {Id = _}).ToList(),
                    MinimumQuantityProductsRequiredInCategories =
                    (x.DiscountConditionCategories.IsNullOrEmpty() ||
                     !x.MinimumQuantityProductsRequiredInCategories.HasValue)
                        ? (int?) null
                        : Math.Max(x.MinimumQuantityProductsRequiredInCategories.Value, 1),
                    MinimumQuantityRequiredProducts =
                        (x.DiscountConditionProducts.IsNullOrEmpty() || !x.MinimumQuantityRequiredProducts.HasValue)
                            ? (int?) null
                            : Math.Max(x.MinimumQuantityRequiredProducts.Value, 1),
                    MinimumCategorySubtotalBeforeDiscounts = x.MinimumCategorySubtotalBeforeDiscounts,
                    MinimumOrderAmount = x.MinimumOrderAmount == 0 ? null : x.MinimumOrderAmount,
                    MinimumLifetimeValueAmount =
                        x.MinimumLifetimeValueAmount == 0 ? null : x.MinimumLifetimeValueAmount,
                    MaxRedemptionCount = x.MaxRedemptionCount,
                    StartDate = x.StartDate,
                    ExpirationDate = x.ExpirationDate,
                    RequiresCoupon = x.RequiresCoupon,
                    CouponCode = x.CouponCode
                }))
                .ForMember(x => x.Target, opt => opt.ResolveUsing(x => new DC.DiscountTarget
                {
                    Type = x.Target,
                    ExcludeItemsWithExistingShippingDiscounts = x.ExcludeItemsWithExistingShippingDiscounts,
                    ExcludeItemsWithExistingProductDiscounts = x.ExcludeItemsWithExistingProductDiscounts,
                    MaximumQuantityPerRedemption = x.MaximumQuantityPerRedemption.HasValue
                        ? Math.Max(x.MaximumQuantityPerRedemption.Value, 1)
                        : (int?) null,
                    Categories = (x.Categories ?? Enumerable.Empty<int>()).Select(_ => new DC.TargetedCategory {Id = _})
                        .ToList(),
                    IncludedCategoriesOperator = x.IsIncludedCategoriesAllOperator
                        ? DC.DiscountTarget.TargetedCategoriesOperators.ALL
                        : DC.DiscountTarget.TargetedCategoriesOperators.ANY,
                    ExcludedCategories = (x.ExcludedCategories ?? Enumerable.Empty<int>())
                        .Select(_ => new DC.TargetedCategory {Id = _}).ToList(),
                    ExcludedProducts = (x.ExcludedProducts ?? Enumerable.Empty<string>())
                        .Select(_ => new DC.TargetedProduct {ProductCode = _}).ToList(),
                    Products = (x.Products ?? Enumerable.Empty<string>())
                        .Select(_ => new DC.TargetedProduct {ProductCode = _}).ToList(),
                    ShippingMethods = (x.ShippingMethods ?? Enumerable.Empty<string>())
                        .Select(_ => new DC.TargetedShippingMethod {Code = _}).ToList(),
                    ShippingZones = (x.ShippingZones ?? Enumerable.Empty<string>())
                        .Select(_ => new DC.TargetedShippingZone() {Zone = _}).ToList(),
                    IncludeAllProducts = x.IncludeAllProducts,
                    AppliesToLeastExpensiveProductsFirst = x.AppliesToLeastExpensiveProductsFirst,
                }))

                .ForMember(dc => dc.IncludedPriceLists, op => op.ResolveUsing(x => x.IncludedPriceLists))

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
                .ForMember(dc => dc.AuditInfo, opt => opt.Ignore());

            CreateMap<ThresholdMessage, DC.ThresholdMessage>()
                .ForMember(dest => dest.Content,
                    op => op.ResolveUsing(src =>
                        new DC.ThresholdMessageLocalizedContent {MessageTemplate = src.MessageTemplate}));

            CreateMap<DC.ThresholdMessage, ThresholdMessage>()
                .ForMember(dest => dest.MessageTemplate,
                    op => op.ResolveUsing(src => src.Content != null ? src.Content.MessageTemplate : string.Empty));

            MapCouponSets();
        }

        private void MapCouponSets()
        {
            CreateMap<DC.CouponSet, CouponSet>();
            CreateMap<CouponSet, DC.CouponSet>()
                .ForMember(x => x.AuditInfo, op => op.Ignore());

            CreateMap<DC.Coupon, Coupon>()
                .ForMember(x => x.CreateDate,
                    op => op.ResolveUsing(dc => dc.AuditInfo?.CreateDate))
                .ForMember(x => x.CreateBy,
                    op => op.ResolveUsing(dc => dc.AuditInfo?.CreateBy))
                .ForMember(x => x.UpdateDate,
                    op => op.ResolveUsing(dc => dc.AuditInfo?.UpdateDate))
                .ForMember(x => x.UpdateBy,
                    op => op.ResolveUsing(dc => dc.AuditInfo?.UpdateBy));

                    

            CreateMap<Coupon, DC.Coupon>()
                .ForMember(x => x.AuditInfo, op => op.Ignore());

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