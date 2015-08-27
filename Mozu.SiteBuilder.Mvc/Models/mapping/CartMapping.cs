using AutoMapper;
using System.Linq;

namespace Mozu.SiteBuilder.Mvc.Models.Mapping
{
    public class CartMapping: Profile
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
            Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.Carts.Cart, Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.Cart>();
            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.Cart, Mozu.CommerceRuntime.Contracts.Carts.Cart>();
            Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.Carts.CartItem, Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.CartItem>();
            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.CartItem, Mozu.CommerceRuntime.Contracts.Carts.CartItem>();
            Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.Products.Product, Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.Product>();
            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.Product, Mozu.CommerceRuntime.Contracts.Products.Product>();
         //   Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.Carts.CartItem, CartItem>();
         //  // Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.Commerce.CommerceUnitPrice .CommerceItemPrice , CartItemPrice>();
         //   Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.Carts.Fee, Fee>();
         //   Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.Products .Product, Product>();
         //   Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.Products.ProductOption, ProductOption>();

         //   Mapper.CreateMap<CartItem, Mozu.CommerceRuntime.Contracts.Carts.CartItem>();
         //   Mapper.CreateMap<Product, Mozu.CommerceRuntime.Contracts.Products.Product>()
         //       //.ForMember(x => x.Price, op => op.MapFrom(x => new Mozu.CommerceRuntime.Contracts.CartOrder.ProductPrice { Price = x.Price }))
         //       ;
         ////   Mapper.CreateMap<CartItemPrice, Mozu.CommerceRuntime.Contracts.Commerce.CommerceItemPrice>();
         //   Mapper.CreateMap<Fee, Mozu.CommerceRuntime.Contracts.Carts.Fee>();
         //   Mapper.CreateMap<ProductOption, Mozu.CommerceRuntime.Contracts.Products.ProductOption>();

         //   //Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.ProductConfigurationRequest, Mozu.CommerceRuntime.Contracts.Carts.CartItem>()
            //    .ForMember(x => x.Product, op => op.MapFrom(req =>
            //     new Mozu.CommerceRuntime.Contracts.Products.Product()
            //        {
            //            ProductCode = req.ProductCode,
            //            VariationProductCode = req.variationProductCode,
            //            Options = (req.Options ?? System.Linq.Enumerable.Empty<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.ProductOptionSelection>()).Select(x =>
            //                new Mozu.CommerceRuntime.Contracts.Products.ProductOption()
            //                {
            //                    ProductOptionValueId = x.Id ,
            //                    ShopperEnteredValue = x.value
            //                }).ToList()
            //        }))
            //    .ForMember(x => x.Quantity, op => op.MapFrom(req => req.Quantity))
                    ;

            //Mapper.AssertConfigurationIsValid(this.ProfileName);
        }
    }
}
