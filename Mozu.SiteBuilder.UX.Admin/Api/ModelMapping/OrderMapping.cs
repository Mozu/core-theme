using AutoMapper;


namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    using Contracts = Mozu.CommerceRuntime.Contracts.Orders;
    using VM = Mozu.SiteBuilder.UX.Models.Orders;
    public class OrderMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            //Mapper.CreateMap<VM.Order, Contracts.Order>();
            //Mapper.CreateMap<Contracts.Order, VM.Order>()
            //    .ForMember(x => x.BillingFirstName, op => op.Ignore())
            //    .ForMember(x => x.BillingLastName, op => op.Ignore());

            //Mapper.CreateMap<VM.AppliedDiscount, Contracts.AppliedDiscount>();
            //Mapper.CreateMap<Contracts.AppliedDiscount, VM.AppliedDiscount>();

            //Mapper.CreateMap<VM.Category, Contracts.Category>();
            //Mapper.CreateMap<Contracts.Category, VM.Category>();

            ////Mapper.CreateMap<VM.Discount, Contracts.Discount>();
            ////Mapper.CreateMap<Contracts.Discount, VM.Discount>();

            //Mapper.CreateMap<VM.Measurement, Mozu.Core.Api.Contracts.Measurement>();
            //Mapper.CreateMap<Mozu.Core.Api.Contracts.Measurement, VM.Measurement>();

            //Mapper.CreateMap<VM.OrderItem, Contracts.OrderItem>();
            //Mapper.CreateMap<Contracts.OrderItem, VM.OrderItem>();

            //Mapper.CreateMap<VM.OrderNote, Contracts.OrderNote>();
            //Mapper.CreateMap<Contracts.OrderNote, VM.OrderNote>();

            //Mapper.CreateMap<VM.PackageMeasurements, Contracts.PackageMeasurements>();
            //Mapper.CreateMap<Contracts.PackageMeasurements, VM.PackageMeasurements>();

            //Mapper.CreateMap<VM.PaymentCardReference, Contracts.PaymentCardReference>();
            //Mapper.CreateMap<Contracts.PaymentCardReference, VM.PaymentCardReference>();

            //Mapper.CreateMap<VM.PaymentReference, Contracts.PaymentReference>();
            //Mapper.CreateMap<Contracts.PaymentReference, VM.PaymentReference>();

            //Mapper.CreateMap<VM.PaymentTransaction, Contracts.PaymentTransaction>();
            //Mapper.CreateMap<Contracts.PaymentTransaction, VM.PaymentTransaction>();

            //Mapper.CreateMap<VM.PaymentTransactionInteraction, Contracts.PaymentTransactionInteraction>();
            //Mapper.CreateMap<Contracts.PaymentTransactionInteraction, VM.PaymentTransactionInteraction>();

            //Mapper.CreateMap<VM.Product, Contracts.Product>();
            //Mapper.CreateMap<Contracts.Product, VM.Product>();

            //Mapper.CreateMap<VM.ProductOption, Contracts.ProductOption>();
            //Mapper.CreateMap<Contracts.ProductOption, VM.ProductOption>();

            //Mapper.CreateMap<VM.ProductPrice, Contracts.ProductPrice>();
            //Mapper.CreateMap<Contracts.ProductPrice, VM.ProductPrice>();

            //Mapper.CreateMap<VM.ProductStock, Contracts.ProductStock>();
            //Mapper.CreateMap<Contracts.ProductStock, VM.ProductStock>();

            //Mapper.CreateMap<VM.Shipment, Contracts.Shipment>();
            //Mapper.CreateMap<Contracts.Shipment, VM.Shipment>();

            //Mapper.CreateMap<VM.ShippingPrice, Contracts.ShippingPrice>();
            //Mapper.CreateMap<Contracts.ShippingPrice, VM.ShippingPrice>();

            //Mapper.CreateMap<VM.ShopperNotes, Contracts.ShopperNotes>();
            //Mapper.CreateMap<Contracts.ShopperNotes, VM.ShopperNotes>();
        }
    }
}