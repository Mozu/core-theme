using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Payments;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Models;
using System.Collections.Generic;
using DCReturns = Mozu.CommerceRuntime.Contracts.Returns;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class ReturnMapping : Profile
    {
        public ReturnMapping()
        {
            CreateMap<DCReturns.Return, Return>()
                .AfterMap(InterpolatePaymentInteractionsIntoRefunds);
        }

        private void InterpolatePaymentInteractionsIntoRefunds(DCReturns.Return dcReturn, Return sbReturn)
        {
            sbReturn.ReturnRefunds = new List<ReturnRefund>();
            foreach (var payment in dcReturn.Payments)
            {
                foreach (var interaction in payment.Interactions)
                {
                    // If the payment was credited successfully:
                    // - PWA payments will have interaction status as CreditPending
                    // - Rest all payment types will have interaction status as Credited.
                    if (!string.IsNullOrEmpty(interaction.ReturnId) && interaction.ReturnId.Equals(dcReturn.Id)
                        && (interaction.Status.EqualsIgnoreCase("credited") || interaction.Status.EqualsIgnoreCase("CreditPending")))
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
                            CardType = payment.PaymentType == PaymentTypeConst.CREDIT_CARD ? payment.BillingInfo?.Card?.PaymentOrCardType : null,
                            ReturnId = interaction.ReturnId,
                            RefundId = interaction.RefundId,
                            TokenType = payment.BillingInfo?.Token?.Type
                        };

                        if (payment.GatewayGiftCard != null)
                        {
                            refund.CardNumber = payment.GatewayGiftCard.CardNumber;
                        }
                        if (!string.IsNullOrWhiteSpace(payment.BillingInfo?.Card?.CCLastFour))
                        {
                            refund.CCLastFour = string.Format("************{0}", payment.BillingInfo?.Card?.CCLastFour);
                        }

                        sbReturn.ReturnRefunds.Add(refund);
                    }
                }
            }
        }
    }

    public static class ReturnMappingExtention
    {
        public static Return ToSiteBuilder(this DCReturns.Return dcReturn)
        {
            return Mapper.Map<DCReturns.Return, Return>(dcReturn);
        }
    }
}
