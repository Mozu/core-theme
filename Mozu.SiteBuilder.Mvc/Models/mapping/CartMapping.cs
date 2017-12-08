using AutoMapper;
using System.Linq;

namespace Mozu.SiteBuilder.Mvc.Models.Mapping
{
    public class CartMapping: Profile
    {
        public CartMapping()
        { 
            CreateMap<Mozu.CommerceRuntime.Contracts.Carts.Cart, Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.Cart>();
            CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.Cart, Mozu.CommerceRuntime.Contracts.Carts.Cart>();
            CreateMap<Mozu.CommerceRuntime.Contracts.Carts.CartItem, Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.CartItem>();
            CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.CartItem, Mozu.CommerceRuntime.Contracts.Carts.CartItem>();
            CreateMap<Mozu.CommerceRuntime.Contracts.Products.Product, Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.Product>();
            CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Commerce.Product, Mozu.CommerceRuntime.Contracts.Products.Product>();
         //   CreateMap<Mozu.CommerceRuntime.Contracts.Carts.CartItem, CartItem>();
         //  // CreateMap<Mozu.CommerceRuntime.Contracts.Commerce.CommerceUnitPrice .CommerceItemPrice , CartItemPrice>();
         //   CreateMap<Mozu.CommerceRuntime.Contracts.Carts.Fee, Fee>();
         //   CreateMap<Mozu.CommerceRuntime.Contracts.Products .Product, Product>();
         //   CreateMap<Mozu.CommerceRuntime.Contracts.Products.ProductOption, ProductOption>();

         //   CreateMap<CartItem, Mozu.CommerceRuntime.Contracts.Carts.CartItem>();
         //   CreateMap<Product, Mozu.CommerceRuntime.Contracts.Products.Product>()
         //       //.ForMember(x => x.Price, op => op.MapFrom(x => new Mozu.CommerceRuntime.Contracts.CartOrder.ProductPrice { Price = x.Price }))
         //       ;
         ////   CreateMap<CartItemPrice, Mozu.CommerceRuntime.Contracts.Commerce.CommerceItemPrice>();
         //   CreateMap<Fee, Mozu.CommerceRuntime.Contracts.Carts.Fee>();
         //   CreateMap<ProductOption, Mozu.CommerceRuntime.Contracts.Products.ProductOption>();

         //   //CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.ProductConfigurationRequest, Mozu.CommerceRuntime.Contracts.Carts.CartItem>()
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
