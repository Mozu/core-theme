using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AutoMapper;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Returns;
using ReturnsDC = Mozu.CommerceRuntime.Contracts.Returns;
using OrdersDC = Mozu.CommerceRuntime.Contracts.Orders;
using ProductsDC = Mozu.CommerceRuntime.Contracts.Products;
using PaymentsDC = Mozu.CommerceRuntime.Contracts.Payments;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using static Mozu.CommerceRuntime.Contracts.Payments.PaymentInteraction;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class ReturnMapping : Profile
    {
        public ReturnMapping()
        {
            Map_DcReturn_to_Return();
            Map_DcReturnItem_to_ReturnItem();
            Map_DcOrderNote_to_OrderNote();
            Map_DcProductOption_to_ProductOption();
            Map_Return_to_DcReturn();
            Map_ReturnItem_to_DcReturnItem();
            Map_OrderNote_to_DcOrderNote();
        }

        private static decimal GetItemProductTotal(ReturnsDC.ReturnItem item)
        {
            return item.TotalWithoutWeightedShippingAndHandling.HasValue
                ? item.TotalWithoutWeightedShippingAndHandling.GetValueOrDefault()
                : item.ProductLossAmount.GetValueOrDefault() + item.ProductLossTaxAmount.GetValueOrDefault();
        }

        private static decimal GetItemShippingAndHandlingTotal(ReturnsDC.ReturnItem item)
        {
            return item.TotalWithWeightedShippingAndHandling.HasValue
                ? item.TotalWithWeightedShippingAndHandling.GetValueOrDefault() - item.TotalWithoutWeightedShippingAndHandling.GetValueOrDefault()
                : item.ShippingLossAmount.GetValueOrDefault() + item.ShippingLossTaxAmount.GetValueOrDefault();
        }

        private void Map_DcReturn_to_Return()
        {
            CreateMap<ReturnsDC.Return, Return>()
            .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
            .ForMember(x => x.AvailableActions, op => op.ResolveUsing(dc => dc.AvailableActions))
            .ForMember(x => x.ReturnNumber, op => op.ResolveUsing(dc => dc.ReturnNumber))
            .ForMember(x => x.OriginalOrderId, op => op.ResolveUsing(dc => dc.OriginalOrderId))
            .ForMember(x => x.OriginalOrderNumber, op => op.ResolveUsing(dc => dc.OriginalOrderNumber))
            .ForMember(x => x.ReturnOrderId, op => op.ResolveUsing(dc => dc.ReturnOrderId))
            .ForMember(x => x.Status, op => op.ResolveUsing(dc => dc.Status))
            .ForMember(x => x.ReceiveStatus, op => op.ResolveUsing(dc => dc.ReceiveStatus))
            .ForMember(x => x.RefundStatus, op => op.ResolveUsing(dc => dc.RefundStatus))
            .ForMember(x => x.ReplaceStatus, op => op.ResolveUsing(dc => dc.ReplaceStatus))
            .ForMember(x => x.Items, op => op.ResolveUsing(dc => dc.Items))
            .ForMember(x => x.RMADeadline, op => op.ResolveUsing(dc => dc.RMADeadline))
            .ForMember(x => x.ReturnType, op => op.ResolveUsing(dc => dc.ReturnType))
            .ForMember(x => x.RefundAmount, op => op.ResolveUsing(dc => dc.RefundAmount))
            .ForMember(x => x.Payments, op => op.ResolveUsing(dc => dc.Payments))
            .ForMember(x => x.TenantId, op => op.ResolveUsing(dc => dc.TenantId))
            .ForMember(x => x.SiteId, op => op.ResolveUsing(dc => dc.SiteId))
            .ForMember(x => x.UserId, op => op.ResolveUsing(dc => dc.UserId))
            .ForMember(x => x.ChannelCode, op => op.ResolveUsing(dc => dc.ChannelCode))
            .ForMember(x => x.CreateDate, op => op.ResolveUsing(x => x.AuditInfo?.CreateDate))
            .ForMember(x => x.UpdateDate, op => op.ResolveUsing(x => x.AuditInfo?.UpdateDate))
            .ForMember(x => x.Notes, op => op.ResolveUsing(dc => dc.Notes))
            .ForMember(x => x.ProductLossAmount, op => op.ResolveUsing(dc => dc.ProductLossTotal))
            .ForMember(x => x.ShippingLossAmount, op => op.ResolveUsing(dc => dc.ShippingLossTotal))
            .ForMember(x => x.TotalLossAmount, op => op.ResolveUsing(dc => dc.LossTotal))
            .ForMember(x => x.ProductTotal, op => op.ResolveUsing(dc => dc.Items.Sum(item => GetItemProductTotal(item))))
            .ForMember(x => x.CustomerAccountId, op => op.ResolveUsing(dc => dc.CustomerAccountId))
            .ForMember(x => x.Contact, op => op.ResolveUsing(dc => dc.Contact))
            .ForMember(x => x.CustomerFirstName, op => op.ResolveUsing(dc => dc.Contact?.FirstName))
            .ForMember(x => x.CustomerLastName, op => op.ResolveUsing(dc => dc.Contact?.LastNameOrSurname))
            .ForMember(x => x.CustomerEmail, op => op.ResolveUsing(dc => dc.Contact?.Email))
            .ForMember(x => x.CompanyName, op => op.ResolveUsing(dc => dc.Contact?.CompanyOrOrganization))
            .ForMember(x => x.UpdatedBy, op => op.ResolveUsing(dc => dc.AuditInfo?.UpdateBy))
            .ForMember(x => x.CreatedBy, op => op.ResolveUsing(dc => dc.AuditInfo?.CreateBy))
            .ForMember(x => x.TotalItemsToRefund, op => op.ResolveUsing(dc => dc.Items.Where(x => x.ReturnType == "Refund").Sum(x => x.Reasons?.Sum(y => y.Quantity) ?? 0)))
            .ForMember(x => x.TotalItemsToReplace, op => op.ResolveUsing(dc => dc.Items.Where(x => x.ReturnType == "Replace").Sum(x => x.Reasons?.Sum(y => y.Quantity) ?? 0)))
            .ForMember(x => x.ItemsRefunded, op => op.ResolveUsing(dc => dc.Items.Where(x => x.RefundAmount > 0).Sum(x => x.Reasons?.Sum(y => y.Quantity) ?? 0)))
            .ForMember(x => x.ItemsReplaced, op => op.ResolveUsing(dc => dc.Items.Sum(x => x.QuantityReplaced)))
            // Customer notes are provided on the items, but the admin shows them all aggregated into a single list.
            .ForMember(x => x.CustomerNotes, op => op.ResolveUsing(dc => dc.Items.SelectMany(x => x.Notes).Where(x => x != null).ToList()))
            .ForMember(x => x.ReturnOrders, op => op.Ignore())
            .ForMember(x => x.ChannelName, op => op.Ignore())
            .ForMember(X => X.DefaultProcessingFee, op => op.Ignore())
            .AfterMap(SetRefundAmountForReturnOnPayment)
            .AfterMap(InterpolatePaymentInteractionsIntoRefunds)
            ;
        }

        private void SetRefundAmountForReturnOnPayment(ReturnsDC.Return dcReturn, Return ret)
        {
            foreach (var payment in ret.Payments)
            {
                payment.AmountRefunded = payment.Interactions
                    .Where(i => !string.IsNullOrEmpty(i.ReturnId) || !string.IsNullOrEmpty(i.RefundId))
                    .Where(i => !i.Status.EqualsIgnoreCase("FAILED"))
                    .Sum(i => i.Amount ?? 0m);

                payment.AmountRefundedOnReturn = payment.Interactions
                    .Where(i => !string.IsNullOrEmpty(i.ReturnId) && i.ReturnId.Equals(ret.Id) && !i.Status.EqualsIgnoreCase("FAILED"))
                    .Sum(i => i.Amount ?? 0m);

                // Payment mapping may change InteractionType from Credit to Refund.
                payment.AmountTotalCreditAndRefund = payment.Interactions
                    .Where(i => new[] { "Credit", "Refund" }.Contains(i.InteractionType, StringComparer.OrdinalIgnoreCase) && !i.Status.EqualsIgnoreCase("FAILED"))
                    .Sum(i => i.Amount ?? 0m);
            }
        }

        private void Map_DcOrderNote_to_OrderNote()
        {
            CreateMap<OrdersDC.OrderNote, OrderNote>()
                .ForMember(x => x.NoteId, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => dc.AuditInfo == null ? null : dc.AuditInfo.CreateDate))
                .ForMember(x => x.CreateBy, op => op.ResolveUsing(dc => dc.AuditInfo == null ? null : dc.AuditInfo.CreateBy))
                .ForMember(x => x.UpdateDate, op => op.ResolveUsing(dc => dc.AuditInfo == null ? null : dc.AuditInfo.UpdateDate))
                .ForMember(x => x.UpdateBy, op => op.ResolveUsing(dc => dc.AuditInfo == null ? null : dc.AuditInfo.UpdateBy))
                .ForMember(x => x.OrderId, op => op.Ignore())
                ;
        }

        private void Map_DcReturnItem_to_ReturnItem()
        {
            CreateMap<ReturnsDC.ReturnItem, ReturnItem>()
            .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
            .ForMember(x => x.OrderItemId, op => op.ResolveUsing(dc => dc.OrderItemId))
            .ForMember(x => x.ProductCode, op => op.ResolveUsing(dc => dc.Product == null ? null : (!string.IsNullOrWhiteSpace(dc.Product.VariationProductCode) ? dc.Product.VariationProductCode : dc.Product.ProductCode)))
            .ForMember(x => x.ProductName, op => op.ResolveUsing(dc => dc.Product?.Name))
            .ForMember(x => x.ImageAlternateText, op => op.ResolveUsing(dc => dc.Product?.ImageAlternateText))
            .ForMember(x => x.ImageUrl, op => op.ResolveUsing(dc => dc.Product?.ImageUrl))
            .ForMember(x => x.Notes, op => op.ResolveUsing(dc => dc.Notes))
            // TODO: Going through the API, you can have multiple return reasons, each with their own quantity.
            .ForMember(x => x.ReturnReason, op => op.ResolveUsing(dc => dc.Reasons != null && dc.Reasons.Any() ? dc.Reasons.First().Reason : null))
            .ForMember(x => x.ReturnType, op => op.ResolveUsing(dc => dc.ReturnType))
            .ForMember(x => x.ReturnNotRequired, op => op.ResolveUsing(dc => dc.ReturnNotRequired))
            .ForMember(x => x.Quantity, op => op.ResolveUsing(dc => dc.Reasons?.Sum(x => x.Quantity) ?? 0))
            .ForMember(x => x.QuantityReceived, op => op.ResolveUsing(dc => dc.QuantityReceived))
            .ForMember(x => x.ReceiveStatus, op => op.ResolveUsing(dc => dc.ReceiveStatus))
            .ForMember(x => x.QuantityRestockable, op => op.ResolveUsing(dc => dc.QuantityRestockable))
            .ForMember(x => x.QuantityShipped, op => op.ResolveUsing(dc => dc.QuantityShipped))
            .ForMember(x => x.RefundAmount, op => op.ResolveUsing(dc => dc.RefundAmount))
            .ForMember(x => x.RefundStatus, op => op.ResolveUsing(dc => dc.RefundStatus))
            .ForMember(x => x.QuantityReplaced, op => op.ResolveUsing(dc => dc.QuantityReplaced))
            .ForMember(x => x.ReplaceStatus, op => op.ResolveUsing(dc => dc.ReplaceStatus))
            .ForMember(x => x.ProductLossAmount, op => op.ResolveUsing(dc => dc.ProductLossAmount))
            .ForMember(x => x.ProductLossTaxAmount, op => op.ResolveUsing(dc => dc.ProductLossTaxAmount))
            .ForMember(x => x.ShippingLossAmount, op => op.ResolveUsing(dc => dc.ShippingLossAmount))
            .ForMember(x => x.ShippingLossTaxAmount, op => op.ResolveUsing(dc => dc.ShippingLossTaxAmount))
            .ForMember(x => x.ProductTotal, op => op.ResolveUsing(dc => GetItemProductTotal(dc)))
            .ForMember(x => x.ShippingAndHandlingTotal, op => op.ResolveUsing(dc => GetItemShippingAndHandlingTotal(dc)))
            .ForMember(x => x.OrderLineId, op => op.ResolveUsing(dc => dc.OrderLineId))
            .ForMember(x => x.OrderItemOptionAttributeFQN, op => op.ResolveUsing(dc => dc.OrderItemOptionAttributeFQN))
            .ForMember(x => x.ExcludeProductExtras, op => op.ResolveUsing(dc => dc.ExcludeProductExtras))
            .ForMember(x => x.BundleItems, op => op.ResolveUsing(dc => dc.Product?.BundledProducts.Where(x => string.IsNullOrEmpty(x.OptionAttributeFQN)).ToList()))
            .ForMember(x => x.Extras, op => op.ResolveUsing(dc => dc.Product?.BundledProducts.Where(x => !string.IsNullOrEmpty(x.OptionAttributeFQN)).ToList()))
            .ForMember(x => x.QuantityReturnable, op => op.ResolveUsing(dc =>  (dc.Reasons?.Sum(x => x.Quantity) ?? 0) - (dc.QuantityReplaced ?? 0)))
            ;
        }

        private void Map_DcProductOption_to_ProductOption()
        {
            CreateMap<ProductsDC.ProductOption, ProductOption>();
        }

        private void Map_Return_to_DcReturn()
        {
            CreateMap<Return, ReturnsDC.Return>()
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
            .ForMember(dc => dc.Notes, op => op.Ignore())
            ;
        }

        private void Map_OrderNote_to_DcOrderNote()
        {
            CreateMap<OrderNote, OrdersDC.OrderNote>()
                .ForMember(dc => dc.Id, op => op.ResolveUsing(x => x.NoteId))
                // Ignore
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                ;
        }

        private void Map_ReturnItem_to_DcReturnItem()
        {
            CreateMap<ReturnItem, ReturnsDC.ReturnItem>()
                .ForMember(dc => dc.Id, op => op.ResolveUsing(x => x.Id))
                .ForMember(dc => dc.OrderItemId, op => op.ResolveUsing(x => string.IsNullOrEmpty(x.OrderItemId) ? null : x.OrderItemId))
                .ForMember(dc => dc.Product, op => op.ResolveUsing(x => x.ProductCode == null ? null : new ProductsDC.Product { ProductCode = x.ProductCode }))
                .ForMember(dc => dc.Reasons, op => op.ResolveUsing(x => new List<ReturnsDC.ReturnReason> { new ReturnsDC.ReturnReason { Quantity = x.Quantity, Reason = x.ReturnReason } }))
                .ForMember(dc => dc.ReturnType, op => op.ResolveUsing(x => x.ReturnType))
                .ForMember(dc => dc.ReturnNotRequired, op => op.ResolveUsing(x => x.ReturnNotRequired))
                .ForMember(dc => dc.QuantityReceived, op => op.ResolveUsing(x => x.QuantityReceived))
                .ForMember(dc => dc.QuantityRestockable, op => op.ResolveUsing(x => x.QuantityRestockable))
                .ForMember(dc => dc.QuantityShipped, op => op.ResolveUsing(x => x.QuantityShipped))
                .ForMember(dc => dc.RefundAmount, op => op.ResolveUsing(x => x.RefundAmount))
                .ForMember(dc => dc.QuantityReplaced, op => op.ResolveUsing(x => x.QuantityReplaced))
                .ForMember(dc => dc.ProductLossAmount, op => op.ResolveUsing(x => x.ProductLossAmount))
                .ForMember(dc => dc.ProductLossTaxAmount, op => op.ResolveUsing(x => x.ProductLossTaxAmount))
                .ForMember(dc => dc.ShippingLossAmount, op => op.ResolveUsing(x => x.ShippingLossAmount))
                .ForMember(dc => dc.ShippingLossTaxAmount, op => op.ResolveUsing(x => x.ShippingLossTaxAmount))
                .ForMember(dc => dc.OrderLineId, op => op.ResolveUsing(x => x.OrderLineId))
                .ForMember(dc => dc.OrderItemOptionAttributeFQN, op => op.ResolveUsing(x => x.OrderItemOptionAttributeFQN))
                .ForMember(dc => dc.ExcludeProductExtras, op => op.ResolveUsing(x => x.ExcludeProductExtras))
                //ignores
                .ForMember(dc => dc.BundledProducts, op => op.Ignore())
                .ForMember(dc => dc.Notes, op => op.Ignore())
                .ForMember(dc => dc.TotalWithoutWeightedShippingAndHandling, op => op.Ignore())
                .ForMember(dc => dc.TotalWithWeightedShippingAndHandling, op => op.Ignore());
        }

        private void InterpolatePaymentInteractionsIntoRefunds(ReturnsDC.Return dcReturn, Return sbReturn)
        {
            sbReturn.ReturnRefunds = new List<ReturnRefund>();
            foreach (var payment in dcReturn.Payments)
            {
                foreach(var interaction in payment.Interactions)
                {
                    if (!string.IsNullOrEmpty(interaction.ReturnId) && interaction.ReturnId.Equals(dcReturn.Id) && interaction.Status.EqualsIgnoreCase("credited"))
                    {
                        var refund = new ReturnRefund
                        {
                            RefundAmount = interaction.Amount,
                            CardNumber = payment.BillingInfo?.Card?.CardNumberPartOrMask,
                            CreateDate = interaction.AuditInfo?.CreateDate,
                            CreateBy = interaction.AuditInfo?.CreateBy,
                            Id = interaction.Id,
                            PaymentType = payment.PaymentType,
                            NameOnCard = payment.BillingInfo?.Card?.NameOnCard,
                            CardType = payment.PaymentType == PaymentsDC.PaymentTypeConst.CREDIT_CARD ? payment.BillingInfo?.Card?.PaymentOrCardType : null,
                            ReturnId = interaction.ReturnId,
                            RefundId = interaction.RefundId,
                            TokenType = payment.BillingInfo?.Token?.Type
                        };

                        sbReturn.ReturnRefunds.Add(refund);
                    }
                }
            }
        }
    }
}
