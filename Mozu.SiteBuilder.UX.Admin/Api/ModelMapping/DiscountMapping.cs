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
                .ForMember(x => x.Amount, op => op.MapFrom(dc => dc.Amount))
                .ForMember(x => x.Name, op => op.MapFrom(dc => dc.Content.Name))
                .ForMember(x => x.AmountType, op => op.MapFrom(dc => dc.AmountType))
                .ForMember(x => x.Categories, op => op.MapFrom(dc => (from cat in dc.Target.Categories where cat.Id != null select (int)cat.Id).ToArray()))
                .ForMember(x => x.CouponCode, op => op.MapFrom(dc => dc.CouponCode))
                .ForMember(x => x.CurrentRedemptionCount, op => op.MapFrom(dc => dc.CurrentRedemptionCount))
                .ForMember(x => x.DiscountId, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.MaxRedemptionCount, op => op.MapFrom(dc => dc.MaxRedemptionCount))
                .ForMember(x => x.MinimumOrderAmount, op => op.MapFrom(dc => dc.Target.MinimumOrderAmount))
                .ForMember(x => x.Name, op => op.MapFrom(dc => dc.Content.Name))
                .ForMember(x => x.Products, op => op.MapFrom(dc => (from prod in dc.Target.Products where prod.Code != null select prod.Code).ToArray()))
                .ForMember(x => x.RequiresCoupon, op => op.MapFrom(dc => dc.RequiresCoupon))
                .ForMember(x => x.ShippingMethods, op => op.MapFrom(dc => (from sm in dc.Target.ShippingMethods where sm.Code != null select sm.Code).ToArray()))
                .ForMember(x => x.Status, op => op.MapFrom(dc => dc.Status))
                .ForMember(x => x.TargetType, op => op.MapFrom(dc => ((bool)(dc.Target.IncludeAllProducts) ? "AllProducts" : (dc.Target.Type == "FreeShipping" || dc.Target.Type == "Product") ? "Product" : "Order")))
                //.ForMember(x => x.StartDate, op => op.MapFrom(x => !x.StartDate.HasValue ? null :  x.StartDate.Value.ToString("ddd MMM dd yyyy H:mm:ss \"GMT\"K (CDT)")))
                //.ForMember(x => x.EndDate, op => op.MapFrom(x => !x.ExpirationDate.HasValue ? null : x.ExpirationDate.Value.ToString("ddd MMM dd yyyy H:mm:ss \"GMT\"K (CDT)")));
                .ForMember(x => x.StartDate, op => op.MapFrom(dc => dc.StartDate))
                .ForMember(x => x.EndDate, op => op.MapFrom(dc => dc.ExpirationDate))
                ;

            // To data contract
            Mapper.CreateMap<Discount, DC.Discount>()
                .ForMember(dc => dc.Amount, op => op.MapFrom(x => x.Amount))
                .ForMember(dc => dc.AmountType, op => op.MapFrom(x => x.AmountType))
                .ForMember(dc => dc.Content, op => op.MapFrom(x => new DC.DiscountLocalizedContent { LocaleCode = "en-US", Name = x.Name } ))
                .ForMember(dc => dc.CouponCode, op => op.MapFrom(x => x.CouponCode))
                //.ForMember(x => x.CreateBy, op => op.Ignore())
                //.ForMember(x => x.CreateDate, op => op.Ignore())
                .ForMember(dc => dc.CurrentRedemptionCount, op => op.MapFrom(x => x.CurrentRedemptionCount))
                .ForMember(dc => dc.Id, op => op.MapFrom(x => x.DiscountId))
                //.ForMember(x => x.StartDate, op => op.MapFrom(x => string.IsNullOrEmpty(x.StartDate) ? DateTime.Now : (DateTime?)DateTime.Parse(x.StartDate)))
                //.ForMember(x => x.ExpirationDate, op => op.MapFrom(x => string.IsNullOrEmpty (x.EndDate) ? null : (DateTime?)DateTime.Parse(x.EndDate)))
                .ForMember(dc => dc.StartDate, op => op.MapFrom(x => x.StartDate))
                .ForMember(dc => dc.ExpirationDate, op => op.MapFrom(x => x.EndDate))
                .ForMember(dc => dc.MaxRedemptionCount, op => op.MapFrom(x => x.MaxRedemptionCount))
                .ForMember(dc => dc.RequiresCoupon, op => op.MapFrom(x => x.RequiresCoupon))
                .ForMember(dc => dc.Status, op => op.MapFrom(x => x.Status))
                .ForMember(dc => dc.Target, opt => opt.ResolveUsing(x => MapToDiscountTarget(x)))
                // .ForMember(dc => dc.Target, op => op.MapFrom(x => new DC.DiscountTarget())
                //.ForMember(x => x.UpdateBy, op => op.Ignore())
                //.ForMember(x => x.UpdateDate, op => op.Ignore())
                ;

        }

        private DC.DiscountTarget MapToDiscountTarget(Discount d)
        {
            string targetType;
            switch (d.TargetType.ToLowerInvariant())
            {
                case "allproducts":
                case "product":
                    targetType = "Product";
                    break;
                default:
                    targetType = d.AmountType.Equals("FreeShipping", StringComparison.InvariantCultureIgnoreCase) ? "FreeShipping" : "Order";
                    break;
            }


            return new DC.DiscountTarget
                {
                    Categories = (d.Categories ?? new List<int>()).Select(targetedCategory => new DC.TargetedCategory { Id = targetedCategory }).ToList(),
                    Products = (d.Products ?? new List<string>()).Select(targetedProduct => new DC.TargetedProduct { Code = targetedProduct }).ToList(),
                    ShippingMethods = (d.ShippingMethods ?? new List<string>()).Select(targetedShippingMethods => new DC.TargetedShippingMethod { Code = targetedShippingMethods }).ToList(),
                    IncludeAllProducts = d.TargetType.Equals("allproducts", StringComparison.InvariantCultureIgnoreCase),
                    MinimumOrderAmount = d.MinimumOrderAmount,
                    Type = targetType
                };

        }
    }
}