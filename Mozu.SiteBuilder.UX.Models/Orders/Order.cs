using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Orders
{
    [DataContract]
    public class Order : ModelBase
    {
        [DataMember(Name = "id", EmitDefaultValue = false)]
        public string Id { get; set; }

        [DataMember(Name = "availableOrderActions", EmitDefaultValue = false)]
        public List<string> AvailableOrderActions { get; set; }

        [DataMember(Name = "availableShipmentActions", EmitDefaultValue = false)]
        public List<string> AvailableShipmentActions { get; set; }

        [DataMember(Name = "availablePaymentActions", EmitDefaultValue = false)]
        public List<string> AvailablePaymentActions { get; set; }

        [DataMember(Name = "orderNumber", EmitDefaultValue = false)]
        public int? OrderNumber { get; set; }

        [DataMember(Name = "originalCartId", EmitDefaultValue = false)]
        public string OriginalCartId { get; set; } // New

        [DataMember(Name = "ShopperNotes", EmitDefaultValue = false)]
        public ShopperNotes ShopperNotes { get; set; } // New

        [DataMember(Name = "userId", EmitDefaultValue = false)]
        public string UserId { get; set; } // New

        [DataMember(Name = "customerAccountId", EmitDefaultValue = false)]
        public int? CustomerAccountId { get; set; }

        [DataMember(Name = "isoCountryCode", EmitDefaultValue = false)]
        public string ISOCountryCode { get; set; } // New

        [DataMember(Name = "orderStatus", EmitDefaultValue = false)]
        public string OrderStatus { get; set; } // New

        [DataMember(Name = "paymentStatus", EmitDefaultValue = false)]
        public string PaymentStatus { get; set; } // New

        [DataMember(Name = "fulfillmentStatus", EmitDefaultValue = false)]
        public string FulfillmentStatus { get; set; } // New

        [DataMember(Name = "submittedDate", EmitDefaultValue = false)]
        public DateTime? SubmittedDate { get; set; } // New

        [DataMember(Name = "cancelledDate", EmitDefaultValue = false)]
        public DateTime? CancelledDate { get; set; } // New

        [DataMember(Name = "closedDate", EmitDefaultValue = false)]
        public DateTime? ClosedDate { get; set; } // New

        [DataMember(Name = "orderNotes", EmitDefaultValue = false)]
        public List<OrderNote> Notes { get; set; } // New

        [DataMember(Name = "items", EmitDefaultValue = false)]
        public List<OrderItem> Items { get; set; }

        [DataMember(Name = "shipment", EmitDefaultValue = false)]
        public Shipment Shipment { get; set; }

        [DataMember(Name = "orderDiscount", EmitDefaultValue = false)]
        public AppliedDiscount OrderDiscount { get; set; } // New

        [DataMember(Name = "payment", EmitDefaultValue = false)]
        public PaymentReference Payment { get; set; }

        [DataMember(Name = "paymentTransactions", EmitDefaultValue = false)]
        public List<PaymentTransaction> PaymentTransactions { get; set; } // New

        [DataMember(Name = "email", EmitDefaultValue = false)]
        public string Email { get; set; }

        [DataMember(Name = "ipAddress", EmitDefaultValue = false)]
        public string IPAddress { get; set; }

        [DataMember(Name = "subTotal", EmitDefaultValue = false)]
        public decimal? SubTotal { get; set; }

        [DataMember(Name = "discountTotal", EmitDefaultValue = false)]
        public decimal? DiscountTotal { get; set; }

        [DataMember(Name = "shippingTotal", EmitDefaultValue = false)]
        public decimal? ShippingTotal { get; set; }

        [DataMember(Name = "taxTotal", EmitDefaultValue = false)]
        public decimal? TaxTotal { get; set; }

        [DataMember(Name = "total", EmitDefaultValue = false)]
        public decimal? Total { get; set; }

        [DataMember(Name = "lastValidationDate", EmitDefaultValue = false)]
        public DateTime? LastValidationDate { get; set; } // New

        [DataMember(Name = "expirationDate", EmitDefaultValue = false)]
        public DateTime? ExpirationDate { get; set; } // New

        [DataMember(Name = "createDate", EmitDefaultValue = false)]
        public DateTime? CreateDate { get; set; } // New

        [DataMember(Name = "createBy", EmitDefaultValue = false)]
        public string CreateBy { get; set; } // New

        [DataMember(Name = "updateDate", EmitDefaultValue = false)]
        public DateTime? UpdateDate { get; set; } // New

        [DataMember(Name = "updateBy", EmitDefaultValue = false)]
        public string UpdateBy { get; set; } // New

        [DataMember(Name = "billingFirstName", EmitDefaultValue = false)]
        public string BillingFirstName
        {
            get
            {
                if(Payment != null && Payment.Card != null && Payment.Card.BillingAddress != null)
                {
                    return Payment.Card.BillingAddress.FirstName;
                }

                return string.Empty;
            }

            set { }
        }

        [DataMember(Name = "billingLastName", EmitDefaultValue = false)]
        public string BillingLastName
        {
            get
            {
                if (Payment != null && Payment.Card != null && Payment.Card.BillingAddress != null)
                {
                    return Payment.Card.BillingAddress.LastName;
                }

                return string.Empty;
            }

            set {  }
        }
    }
}