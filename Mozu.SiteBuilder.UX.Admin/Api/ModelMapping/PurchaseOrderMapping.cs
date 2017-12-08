using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DCp = Mozu.CommerceRuntime.Contracts.Payments;
namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class PurchaseOrderMapping : Profile
    {
        public PurchaseOrderMapping()
        {
            CreateMap<DCp.PurchaseOrderPaymentTerm, PurchaseOrderPaymentTerm>();
            CreateMap<DCp.PurchaseOrderCustomField, PurchaseOrderCustomField>();
            CreateMap<PurchaseOrderPaymentTerm, DCp.PurchaseOrderPaymentTerm>();
            CreateMap<PurchaseOrderCustomField, DCp.PurchaseOrderCustomField>();
            CreateMap<DCp.PurchaseOrderPayment,PurchaseOrderPayment>()
                .ForMember(x => x.PaymentTerm, op => op.ResolveUsing(d => d.PaymentTerm))
                .ForMember(x => x.CustomFields, op => op.ResolveUsing(d => d.CustomFields));
        }

    }
}