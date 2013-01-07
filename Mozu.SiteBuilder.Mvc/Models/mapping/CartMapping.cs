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
            Mapper.CreateMap<Mozu.Cart.Contracts.Cart, Mozu.SiteBuilder.UX.Models.StoreFront.Cart.Cart>();
            Mapper.CreateMap<Mozu.Cart.Contracts.CartItem, CartItem>();
            Mapper.CreateMap<Mozu.Cart.Contracts.CartItemPrice, CartItemPrice>();
            Mapper.CreateMap<Mozu.Cart.Contracts.Fee, Fee>();
            Mapper.CreateMap<Mozu.Cart.Contracts.Product, Product>();
            Mapper.CreateMap<Mozu.Cart.Contracts.ProductOption, ProductOption>();

            Mapper.CreateMap<CartItem, Mozu.Cart.Contracts.CartItem>();
            Mapper.CreateMap<Product, Mozu.Cart.Contracts.Product>();
            Mapper.CreateMap<CartItemPrice, Mozu.Cart.Contracts.CartItemPrice>();
            Mapper.CreateMap<Fee, Mozu.Cart.Contracts.Fee>();
            Mapper.CreateMap<ProductOption, Mozu.Cart.Contracts.ProductOption>();

            Mapper.CreateMap<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.ProductConfigurationRequest, Mozu.Cart.Contracts.CartItem>()
                .ForMember(x => x.Product, op => op.MapFrom(req =>
                 new Mozu.Cart.Contracts.Product()
                    {
                        ProductCode = req.ProductCode,
                        VariationProductCode = req.variationProductCode,
                        Options = (req.Options ?? System.Linq.Enumerable.Empty<Mozu.SiteBuilder.UX.Models.StoreFront.Catalog.ProductOptionSelection>()).Select(x =>
                            new Mozu.Cart.Contracts.ProductOption()
                            {
                                ProductOptionValueId = x.Id ,
                                ShopperEnteredValue = x.value
                            }).ToList()
                    }));

            //Mapper.AssertConfigurationIsValid(this.ProfileName);
        }
    }
}
