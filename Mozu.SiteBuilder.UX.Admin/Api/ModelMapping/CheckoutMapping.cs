//using AutoMapper;
//using Mozu.PaymentService.Contracts;
//using Mozu.SiteSettings.Order.Contracts;

//namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
//{
//    public class CheckoutMapping: Profile
//    {
//        public override string ProfileName
//        {
//            get
//            {
//                return this.GetType().FullName;
//            }
//        }

//        protected override void Configure()
//        {
//            // To model
//            Mapper.CreateMap<CheckoutSettings, Models.Checkout.CheckoutSettings>();
//            Mapper.CreateMap<PaymentSettings, Models.Checkout.PaymentSettings>();
//            Mapper.CreateMap<CustomerCheckoutSettings, Models.Checkout.CustomerCheckoutSettings>();
//            Mapper.CreateMap<GatewayAccount, Models.Checkout.GatewayAccount>();
//            Mapper.CreateMap<GatewayCredentialFieldValue, Models.Checkout.GatewayCredentialFieldValue>();
//            Mapper.CreateMap<OrderProcessingSettings, Models.Checkout.OrderProcessingSettings>();
//            Mapper.CreateMap<GatewayDefinition, Models.Checkout.GatewayDefinition>();
//            Mapper.CreateMap<GatewayCredentialFieldDefinition, Models.Checkout.GatewayCredentialFieldDefinition>();
//            Mapper.CreateMap<PreAuthorizeDefinition, Models.Checkout.PreAuthorizeDefinition>();
//            Mapper.CreateMap<PreAuthorizeTransactionTypeDataContract, Models.Checkout.PreAuthorizeTransactionTypeDataContract>();

//            // To contract
//            Mapper.CreateMap<Models.Checkout.CheckoutSettings, CheckoutSettings>()
//                .ForMember(x => x.CreateBy, op => op.Ignore())
//                .ForMember(x => x.CreateDate, op => op.Ignore())
//                .ForMember(x => x.UpdateBy, op => op.Ignore())
//                .ForMember(x => x.UpdateDate, op => op.Ignore())
//                .ForMember(x => x.ActivePaymentProvider, op => op.Ignore());

//            Mapper.CreateMap<Models.Checkout.PaymentSettings, PaymentSettings>()
//                .ForMember(x => x.CreateBy, op => op.Ignore())
//                .ForMember(x => x.CreateDate, op => op.Ignore())
//                .ForMember(x => x.UpdateBy, op => op.Ignore())
//                .ForMember(x => x.UpdateDate, op => op.Ignore())
//                .ForMember(x => x.CustomAttributes, op => op.Ignore());

//            Mapper.CreateMap<Models.Checkout.CustomerCheckoutSettings, CustomerCheckoutSettings>()
//                .ForMember(x => x.CreateBy, op => op.Ignore())
//                .ForMember(x => x.CreateDate, op => op.Ignore())
//                .ForMember(x => x.UpdateBy, op => op.Ignore())
//                .ForMember(x => x.UpdateDate, op => op.Ignore())
//                .ForMember(x => x.CustomAttributes, op => op.Ignore());

//            Mapper.CreateMap<Models.Checkout.GatewayAccount, GatewayAccount>();
//            Mapper.CreateMap<Models.Checkout.GatewayCredentialFieldValue, GatewayCredentialFieldValue>();

//            Mapper.CreateMap<Models.Checkout.OrderProcessingSettings, OrderProcessingSettings>()
//                .ForMember(x => x.CreateBy, op => op.Ignore())
//                .ForMember(x => x.CreateDate, op => op.Ignore())
//                .ForMember(x => x.UpdateBy, op => op.Ignore())
//                .ForMember(x => x.UpdateDate, op => op.Ignore())
//                .ForMember(x => x.CustomAttributes, op => op.Ignore());

//            Mapper.CreateMap<Models.Checkout.GatewayDefinition, GatewayDefinition>();
//            Mapper.CreateMap<Models.Checkout.GatewayCredentialFieldDefinition, GatewayCredentialFieldDefinition>();
//            Mapper.CreateMap<Models.Checkout.PreAuthorizeDefinition, PreAuthorizeDefinition>();
//            Mapper.CreateMap<Models.Checkout.PreAuthorizeTransactionTypeDataContract, PreAuthorizeTransactionTypeDataContract>();
//        }
//    }
//}