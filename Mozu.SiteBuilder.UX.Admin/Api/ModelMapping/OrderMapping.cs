using AutoMapper;


namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    using OrdersDC = Mozu.CommerceRuntime.Contracts.Orders;
    using DiscountDC = Mozu.CommerceRuntime.Contracts.Discounts;
    using ProductsDC = Mozu.CommerceRuntime.Contracts.Products ;
    using VM = Mozu.SiteBuilder.UX.Models.Orders;
    public class OrderMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<VM.Order, OrdersDC.Order>();
            Mapper.CreateMap<OrdersDC.Order, VM.Order>()
                .ForMember(x => x.BillingFirstName, op => op.Ignore())
                .ForMember(x => x.BillingLastName, op => op.Ignore());

            Mapper.CreateMap<VM.AppliedDiscount, DiscountDC.AppliedDiscount>();
            Mapper.CreateMap<DiscountDC.AppliedDiscount, VM.AppliedDiscount>();

            Mapper.CreateMap<VM.Category, ProductsDC.Category>();
            Mapper.CreateMap<ProductsDC.Category, VM.Category>();

            //Mapper.CreateMap<VM.Discount, OrdersDC.Discount>();
            //Mapper.CreateMap<OrdersDC.Discount, VM.Discount>();

            Mapper.CreateMap<VM.Measurement, Mozu.Core.Api.Contracts.Measurement>();
            Mapper.CreateMap<Mozu.Core.Api.Contracts.Measurement, VM.Measurement>();

            Mapper.CreateMap<VM.OrderItem, OrdersDC.OrderItem>();
            Mapper.CreateMap<OrdersDC.OrderItem, VM.OrderItem>();

            Mapper.CreateMap<VM.OrderNote, OrdersDC.OrderNote>();
            Mapper.CreateMap<OrdersDC.OrderNote, VM.OrderNote>();

            Mapper.CreateMap<VM.PackageMeasurements, Mozu.CommerceRuntime.Contracts.Commerce.PackageMeasurements>();
            Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.Commerce.PackageMeasurements, VM.PackageMeasurements>();

 

            Mapper.CreateMap<VM.Product, ProductsDC .Product>();
            Mapper.CreateMap<ProductsDC.Product, VM.Product>();

            Mapper.CreateMap<VM.ProductOption, ProductsDC.ProductOption>();
            Mapper.CreateMap<ProductsDC.ProductOption, VM.ProductOption>();

            Mapper.CreateMap<VM.ProductPrice, ProductsDC.ProductPrice>();
            Mapper.CreateMap<ProductsDC.ProductPrice, VM.ProductPrice>();

            Mapper.CreateMap<VM.ProductStock, ProductsDC.ProductStock>();
            Mapper.CreateMap<ProductsDC.ProductStock, VM.ProductStock>();

     

            Mapper.CreateMap<VM.ShopperNotes, OrdersDC.ShopperNotes>();
            Mapper.CreateMap<OrdersDC.ShopperNotes, VM.ShopperNotes>();
        }
    }
}