using System;
using System.Collections.Generic;
using AutoMapper;
using System.Linq;
using Mozu.ProductAdmin.Contracts;

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
            Mapper.CreateMap<Discount, Models.Discount.Discount>()
                .ForMember(x => x.Amount, op => op.MapFrom(x => x.Amount))
                .ForMember(x => x.Name, op => op.MapFrom(x => x.Content.Name))
                .ForMember(x => x.AmountType, op => op.MapFrom(x => x.AmountType))
                .ForMember(x => x.Categories, op => op.MapFrom(x => (from cat in x.Target.Categories where cat.Id != null select (int)cat.Id).ToArray()))
                .ForMember(x => x.CouponCode, op => op.MapFrom(x => x.CouponCode))
                .ForMember(x => x.CurrentRedemptionCount, op => op.MapFrom(x => x.CurrentRedemptionCount))
                .ForMember(x => x.DiscountId, op => op.MapFrom(x => x.Id))
                .ForMember(x => x.MaxRedemptionCount, op => op.MapFrom(x => x.MaxRedemptionCount))
                .ForMember(x => x.MinimumOrderAmount, op => op.MapFrom(x => x.Target.MinimumOrderAmount))
                .ForMember(x => x.Name, op => op.MapFrom(x => x.Content.Name))
                .ForMember(x => x.Products, op => op.MapFrom(x => (from prod in x.Target.Products where prod.Code != null select prod.Code).ToArray()))
                .ForMember(x => x.RequiresCoupon, op => op.MapFrom(x => x.RequiresCoupon))
                .ForMember(x => x.ShippingMethods, op => op.MapFrom(x => (from sm in x.Target.ShippingMethods where sm.Code != null select sm.Code).ToArray()))
                .ForMember(x => x.Status, op => op.MapFrom(x => x.Status))
                .ForMember(x => x.TargetType, op => op.MapFrom(x => ((bool)(x.Target.IncludeAllProducts) ? "allproducts" : (x.Target.Type == "FreeShipping" || x.Target.Type == "Product") ? "Product" : "Order")))
                .ForMember(x => x.StartDate, op => op.MapFrom(x => !x.StartDate.HasValue ? null :  x.StartDate.Value.ToString("ddd MMM dd yyyy H:mm:ss \"GMT\"K (CDT)")))
                .ForMember(x => x.EndDate, op => op.MapFrom(x => !x.ExpirationDate.HasValue ? null : x.ExpirationDate.Value.ToString("ddd MMM dd yyyy H:mm:ss \"GMT\"K (CDT)")));

            // To data contract
            Mapper.CreateMap<Models.Discount.Discount, Discount>()
                .ForMember(x => x.Amount, op => op.MapFrom(x => x.Amount))
                .ForMember(x => x.AmountType, op => op.MapFrom(x => x.AmountType))
                .ForMember(x => x.Content, op => op.MapFrom(x => new DiscountLocalizedContent { LocaleCode = "en-US", Name = x.Name } ))
                .ForMember(x => x.CouponCode, op => op.MapFrom(x => x.CouponCode))
                //.ForMember(x => x.CreateBy, op => op.Ignore())
                //.ForMember(x => x.CreateDate, op => op.Ignore())
                .ForMember(x => x.CurrentRedemptionCount, op => op.MapFrom(x => x.CurrentRedemptionCount))
                .ForMember(x => x.Id, op => op.MapFrom(x => x.DiscountId))
                .ForMember(x => x.ExpirationDate, op => op.MapFrom(x => string.IsNullOrEmpty (x.EndDate) ? null : (DateTime?)DateTime.Parse(x.EndDate)))
                .ForMember(x => x.MaxRedemptionCount, op => op.MapFrom(x => x.MaxRedemptionCount))
                .ForMember(x => x.RequiresCoupon, op => op.MapFrom(x => x.RequiresCoupon))
                .ForMember(x => x.StartDate, op => op.MapFrom(x => string.IsNullOrEmpty(x.StartDate) ? DateTime.Now  : (DateTime?)DateTime.Parse(x.StartDate)))
                .ForMember(x => x.Status, op => op.MapFrom(x => x.Status))
                .ForMember(x => x.Target, op => op.MapFrom(x => new DiscountTarget
                {
                    Categories = x.Categories.Select(targetedCategory => new TargetedCategory { Id = targetedCategory }).ToList(),
                    Products = x.Products.Select(targetedProduct => new TargetedProduct { Code = targetedProduct }).ToList(),
                    ShippingMethods = x.ShippingMethods.Select(targetedShippingMethods => new TargetedShippingMethod { Code = targetedShippingMethods }).ToList(),
                    IncludeAllProducts = x.TargetType == "allproducts",
                    MinimumOrderAmount = x.MinimumOrderAmount,
                    Type = ((x.AmountType == "FreeShipping") ? "FreeShipping" : (x.TargetType == "allproducts" || x.TargetType == "Product") ? "Product" : "Order")
                }))
                //.ForMember(x => x.UpdateBy, op => op.Ignore())
                //.ForMember(x => x.UpdateDate, op => op.Ignore())
                ;

        }
    }
}