using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Returns;
using ReturnsDC = Mozu.CommerceRuntime.Contracts.Returns;
using OrdersDC = Mozu.CommerceRuntime.Contracts.Orders;
using ProductsDC = Mozu.CommerceRuntime.Contracts.Products;

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
            Map_DcReturnItem_to_ReturnItem();
            Map_Return_to_DcReturn();
            Map_ReturnItem_to_DcReturnItem();
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
            .ForMember(x => x.OrderItemId, op => op.ResolveUsing(dc => dc.OrderItemId))
            .ForMember(x => x.ProductCode, op => op.ResolveUsing(dc => dc.Product == null ? null : (!string.IsNullOrWhiteSpace(dc.Product.VariationProductCode) ? dc.Product.VariationProductCode : dc.Product.ProductCode)))
            .ForMember(x => x.OrderItemId, op => op.ResolveUsing(dc => dc.OrderItemId))
            .ForMember(x => x.ReturnReason, op => op.ResolveUsing(dc => dc.Reasons != null && dc.Reasons.Any() ? dc.Reasons.First().Reason : null))
            .ForMember(x => x.RmaNote, op => op.ResolveUsing(dc => (dc.Notes != null && dc.Notes.Any()) ? dc.Notes.First().Text : String.Empty))
            .ForMember(x => x.Quantity, op => op.ResolveUsing(dc => dc.Reasons != null && dc.Reasons.Any() ? dc.Reasons.First().Quantity : 0))
            .ForMember(x => x.QuantityReceived, op => op.ResolveUsing(dc => dc.QuantityReceived))
            .ForMember(x => x.QuantityRestockable, op => op.ResolveUsing(dc => dc.QuantityRestockable))
            .ForMember(x => x.QuantityShipped, op => op.ResolveUsing(dc => dc.QuantityShipped))
            .ForMember(x => x.ProductLossAmount, op => op.ResolveUsing(dc => dc.ProductLossAmount))
            .ForMember(x => x.ProductLossTaxAmount, op => op.ResolveUsing(dc => dc.ProductLossTaxAmount))
            .ForMember(x => x.ShippingLossAmount, op => op.ResolveUsing(dc => dc.ShippingLossAmount))
            .ForMember(x => x.ShippingLossTaxAmount, op => op.ResolveUsing(dc => dc.ShippingLossTaxAmount))
            .ForMember(x => x.OrderLineId, op => op.ResolveUsing(dc => dc.OrderLineId))
            .AfterMap((dc, x) => {
                // for some reason, the service expects us to tell it how many of this item have been fulfilled. 
                // since you can't have created a return that exceeds the # shipped, we should default this field to the quantity.
                x.QuantityShipped = Math.Max(x.QuantityShipped, x.Quantity);
            })
            ;
        }

        private void Map_Return_to_DcReturn()
        {
            Mapper.CreateMap<Return, ReturnsDC.Return>()
            .ForMember(dc => dc.Id, op => op.ResolveUsing(x => x.Id))
            .ForMember(dc => dc.AvailableActions, op => op.ResolveUsing(x => x.AvailableActions))
            .ForMember(dc => dc.ReturnNumber, op => op.ResolveUsing(x => x.ReturnNumber))
            .ForMember(dc => dc.OriginalOrderId, op => op.ResolveUsing(x => x.OriginalOrderId))
            .ForMember(dc => dc.ReturnOrderId, op => op.ResolveUsing(x => x.ReturnOrderId))
            .ForMember(dc => dc.Status, op => op.ResolveUsing(x => x.Status))
            .ForMember(dc => dc.Items, op => op.ResolveUsing(x => x.Items))
            .ForMember(dc => dc.RMADeadline, op => op.ResolveUsing(x => x.RMADeadline))
            .ForMember(dc => dc.ReturnType, op => op.ResolveUsing(x => x.ReturnType))
            .ForMember(dc => dc.RefundAmount, op => op.ResolveUsing(x => x.RefundAmount))
            .ForMember(dc => dc.Payments, op => op.ResolveUsing(x => x.Payments))
            .ForMember(dc => dc.TenantId, op => op.ResolveUsing(x => x.TenantId))
            .ForMember(dc => dc.SiteId, op => op.ResolveUsing(x => x.SiteId))
            .ForMember(dc => dc.UserId, op => op.ResolveUsing(x => x.UserId))
            .ForMember(dc => dc.Notes, op => op.ResolveUsing(x => !String.IsNullOrEmpty(x.RmaNote) ? new List<OrdersDC.OrderNote> { new OrdersDC.OrderNote { Text = x.RmaNote } } : null))

            .ForMember(dc => dc.ProductLossTotal, op => op.ResolveUsing(x => x.ProductLossAmount))
            .ForMember(dc => dc.ShippingLossTotal, op => op.ResolveUsing(x => x.ShippingLossAmount))
            .ForMember(dc => dc.LossTotal, op => op.ResolveUsing(x => x.TotalLossAmount))

            //ignores
            .ForMember(dc => dc.Payments, opt => opt.Ignore())
            .ForMember(dc => dc.CustomerAccountId, op => op.Ignore())
            .ForMember(dc => dc.VisitId, op => op.Ignore())
            .ForMember(dc => dc.WebSessionId, op => op.Ignore())
            .ForMember(dc => dc.CustomerInteractionType, op => op.Ignore())
            .ForMember(dc => dc.LocationCode, op => op.Ignore())
            .ForMember(dc => dc.CurrencyCode, op => op.Ignore())
            .ForMember(dc => dc.AuditInfo, op => op.Ignore())
            .ForMember(dc => dc.Packages, op => op.Ignore())
            .ForMember(dc => dc.ProductLossTotal, op => op.Ignore())
            .ForMember(dc => dc.ShippingLossTotal, op => op.Ignore())
            .ForMember(dc => dc.LossTotal, op => op.Ignore())
            .ForMember(dc => dc.ProductLossTaxTotal, op => op.Ignore())
            .ForMember(dc => dc.ShippingLossTaxTotal, op => op.Ignore())
            .ForMember(dc => dc.ChannelCode, op => op.Ignore())
            .ForMember(dc => dc.ChangeMessages, op => op.Ignore())
            ;
        }

        private void Map_ReturnItem_to_DcReturnItem()
        {
            Mapper.CreateMap<ReturnItem, ReturnsDC.ReturnItem>()
            .ForMember(dc => dc.Id, op => op.ResolveUsing(x => x.Id))
            .ForMember(dc => dc.OrderItemId, op => op.ResolveUsing(x => String.IsNullOrEmpty(x.OrderItemId) ? null : x.OrderItemId))
            .ForMember(dc => dc.Product, op => op.ResolveUsing(x => x.ProductCode == null ? null : new ProductsDC.Product { ProductCode = x.ProductCode }))
            .ForMember(dc => dc.Reasons, op => op.ResolveUsing(x => new List<ReturnsDC.ReturnReason> { new ReturnsDC.ReturnReason { Quantity = x.Quantity, Reason = x.ReturnReason } }))
            .ForMember(dc => dc.Notes, op => op.ResolveUsing(x => !String.IsNullOrEmpty(x.RmaNote) ? new List<OrdersDC.OrderNote> { new OrdersDC.OrderNote { Text = x.RmaNote } } : null))
            .ForMember(dc => dc.QuantityReceived, op => op.ResolveUsing(x => x.QuantityReceived))
            .ForMember(dc => dc.QuantityRestockable, op => op.ResolveUsing(x => x.QuantityRestockable))
            .ForMember(dc => dc.QuantityShipped, op => op.ResolveUsing(x => x.QuantityShipped))
            .ForMember(dc => dc.ProductLossAmount, op => op.ResolveUsing(x => x.ProductLossAmount))
            .ForMember(dc => dc.ProductLossTaxAmount, op => op.ResolveUsing(x => x.ProductLossTaxAmount))
            .ForMember(dc => dc.ShippingLossAmount, op => op.ResolveUsing(x => x.ShippingLossAmount))
            .ForMember(dc => dc.ShippingLossTaxAmount, op => op.ResolveUsing(x => x.ShippingLossTaxAmount))
            .ForMember(dc => dc.OrderLineId, op => op.ResolveUsing(x => x.OrderLineId))
            .ForMember(dc => dc.OrderItemOptionAttributeFQN, op => op.Ignore())
            //ignores
            .ForMember(dc => dc.BundledProducts, op => op.Ignore());
            ;
        }
    }
}
