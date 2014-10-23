using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Returns;
using ReturnsDC = Mozu.CommerceRuntime.Contracts.Returns;


namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class ReturnMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Map_DcReturn_to_Return();

        }

        private void Map_DcReturn_to_Return()
        {
            Mapper.CreateMap<ReturnsDC.Return, Return>()
            .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
            .ForMember(x => x.AvailableActions, op => op.ResolveUsing(dc => dc.AvailableActions))
            .ForMember(x => x.ReturnNumber, op => op.ResolveUsing(dc => dc.ReturnNumber))
            .ForMember(x => x.OriginalOrderId, op => op.ResolveUsing(dc => dc.OriginalOrderId))
            .ForMember(x => x.ReturnOrderId, op => op.ResolveUsing(dc => dc.ReturnOrderId))
            .ForMember(x => x.Status, op => op.ResolveUsing(dc => dc.Status))
            .ForMember(x => x.Items, op => op.ResolveUsing(dc => dc.Items))
            .ForMember(x => x.RMADeadline, op => op.ResolveUsing(dc => dc.RMADeadline))
            .ForMember(x => x.ReturnType, op => op.ResolveUsing(dc => dc.ReturnType))
            .ForMember(x => x.RefundAmount, op => op.ResolveUsing(dc => dc.RefundAmount))
            .ForMember(x => x.Payments, op => op.ResolveUsing(dc => dc.Payments))
            .ForMember(x => x.TenantId, op => op.ResolveUsing(dc => dc.TenantId))
            .ForMember(x => x.SiteId, op => op.ResolveUsing(dc => dc.SiteId))
            .ForMember(x => x.UserId, op => op.ResolveUsing(dc => dc.UserId))
            .ForMember(x => x.CreateDate, op => op.ResolveUsing(x => (x.AuditInfo != null) ? x.AuditInfo.CreateDate : null))
            .ForMember(x => x.UpdateDate, op => op.ResolveUsing(x => (x.AuditInfo != null) ? x.AuditInfo.UpdateDate : null))
            .ForMember(x => x.RmaNote, op => op.ResolveUsing(dc => (dc.Notes != null && dc.Notes.Any()) ? dc.Notes.First().Text : String.Empty))

            .ForMember(x => x.ProductLossAmount, op => op.ResolveUsing(dc => dc.ProductLossTotal))
            .ForMember(x => x.ShippingLossAmount, op => op.ResolveUsing(dc => dc.ShippingLossTotal))
            .ForMember(x => x.TotalLossAmount, op => op.ResolveUsing(dc => dc.LossTotal))
            ;
        }

        private void Map_DcReturnItem_to_ReturnItem()
        {
            Mapper.CreateMap<ReturnsDC.ReturnItem, ReturnItem>()
            .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
            .ForMember(x => x.Notes, op => op.ResolveUsing(dc => dc.Notes))
            .ForMember(x => x.OrderItemId, op => op.ResolveUsing(dc => dc.OrderItemId))
            .ForMember(x => x.Quantity, op => op.ResolveUsing(dc => dc.Reasons != null && dc.Reasons.Any() ? dc.Reasons.First().Quantity : 0))
            .ForMember(x => x.ReturnReason, op => op.ResolveUsing(dc => dc.Reasons != null && dc.Reasons.Any() ? dc.Reasons.First().Reason : null))
            .ForMember(x => x.QuantityReceived, op => op.ResolveUsing(dc => dc.QuantityReceived))
            .ForMember(x => x.QuantityRestockable, op => op.ResolveUsing(dc => dc.QuantityRestockable))
            .ForMember(x => x.QuantityShipped, op => op.ResolveUsing(dc => dc.QuantityShipped))
            .ForMember(x => x.ProductLossAmount, op => op.ResolveUsing(dc => dc.ProductLossAmount))
            .ForMember(x => x.ProductLossTaxAmount, op => op.ResolveUsing(dc => dc.ProductLossTaxAmount))
            .ForMember(x => x.ShippingLossAmount, op => op.ResolveUsing(dc => dc.ShippingLossAmount))
            .ForMember(x => x.ShippingLossTaxAmount, op => op.ResolveUsing(dc => dc.ShippingLossTaxAmount))
            ;
        }
    }
}
