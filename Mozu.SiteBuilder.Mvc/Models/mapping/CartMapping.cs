using AutoMapper;
using Mozu.SiteBuilder.UX.Models.StoreFront.Cart;
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
            Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.Cart.Cart, SiteBuilder.UX.Models.StoreFront.Cart.Cart>()
                ;
            Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.Cart.CartItem, CartItem>();
            Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.CartOrder.ItemPrice, CartItemPrice>();
            Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.Cart.Fee, Fee>();
            Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.CartOrder.Product, Product>();
            Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.CartOrder.ProductOption, ProductOption>();

            Mapper.CreateMap<CartItem, Mozu.CommerceRuntime.Contracts.Cart.CartItem>();
            Mapper.CreateMap<Product, Mozu.CommerceRuntime.Contracts.CartOrder.Product>()
                //.ForMember(x => x.Price, op => op.MapFrom(x => new Mozu.CommerceRuntime.Contracts.CartOrder.ProductPrice { Price = x.Price }))
                ;
            Mapper.CreateMap<CartItemPrice, Mozu.CommerceRuntime.Contracts.CartOrder.ItemPrice>();
            Mapper.CreateMap<Fee, Mozu.CommerceRuntime.Contracts.Cart.Fee>();
            Mapper.CreateMap<ProductOption, Mozu.CommerceRuntime.Contracts.CartOrder.ProductOption>();

            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.ProductConfigurationRequest, Mozu.CommerceRuntime.Contracts.Cart.CartItem>()
                .ForMember(x => x.Product, op => op.MapFrom(req =>
                 new Mozu.CommerceRuntime.Contracts.CartOrder.Product()
                    {
                        ProductCode = req.ProductCode,
                        VariationProductCode = req.variationProductCode,
                        Options = (req.Options ?? System.Linq.Enumerable.Empty<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.ProductOptionSelection>()).Select(x =>
                            new Mozu.CommerceRuntime.Contracts.CartOrder.ProductOption()
                            {
                                ProductOptionValueId = x.Id ,
                                ShopperEnteredValue = x.value
                            }).ToList()
                    }))
                .ForMember(x => x.Quantity, op => op.MapFrom(req => req.Quantity))
                    ;

            //Mapper.AssertConfigurationIsValid(this.ProfileName);
        }
    }
}
