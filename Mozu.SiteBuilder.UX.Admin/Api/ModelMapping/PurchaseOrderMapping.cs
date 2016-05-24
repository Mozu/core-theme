using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;
namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class PurchaseOrderMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<DCp.PurchaseOrderPaymentTerm, PurchaseOrderPaymentTerm>();
            Mapper.CreateMap<DCp.PurchaseOrderCustomField, PurchaseOrderCustomField>();
            Mapper.CreateMap<DCp.PurchaseOrderPayment,PurchaseOrderPayment>()
                .ForMember(x => x.PaymentTerm, op => op.ResolveUsing(d => d.PaymentTerm))
                .ForMember(x => x.CustomFields, op => op.ResolveUsing(d => d.CustomFields));
        }

    }
}