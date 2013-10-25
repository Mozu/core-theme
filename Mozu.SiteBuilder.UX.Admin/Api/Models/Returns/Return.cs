using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Returns
{
    [DataContract(Namespace = "Mozu.services.contracts")]
    public class Return
    {
        [DataMember(EmitDefaultValue = false, Name = "id")]
        public string Id { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "availableActions")]
        public List<string> AvailableActions { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "returnNumber")]
        public int? ReturnNumber { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "originalOrderId")]
        public string OriginalOrderId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "returnOrderId")]
        public string ReturnOrderId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "status")]
        public string Status { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "items")]
        public List<ReturnItem> Items { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "notes")]
        public List<OrderNote> Notes { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "rmaDeadline")]
        public DateTime? RMADeadline { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "type")]
        public string ReturnType { get; set; }


        [DataMember(EmitDefaultValue = false, Name = "refundAmount")]
        public Decimal? RefundAmount { get; set; }


        [DataMember(EmitDefaultValue = false, Name = "payments")]
        public List<OrderPayment> Payments { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "totalLossAmount")]
        public Decimal TotalLossAmount { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "tenantId")]
        public int TenantId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "siteGroupId")]
        public int? MasterCatalogId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "siteId")]
        public int SiteId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "userId")]
        public string UserId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "createDate")]
        public DateTime? CreateDate { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "updateDate")]
        public DateTime? UpdateDate { get; set; }
    }

    [DataContract(Namespace = "Mozu.services.contracts")]
    public class ReturnItem
    {
        [DataMember(EmitDefaultValue = false, Name = "productLossAmount")]
        public Decimal? ProductLossAmount { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "productLossTaxAmount")]
        public Decimal? ProductLossTaxAmount { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "shippingLossAmount")]
        public Decimal? ShippingLossAmount { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "shippingLossTaxAmount")]
        public Decimal? ShippingLossTaxAmount { get; set; }


        [DataMember(EmitDefaultValue = false, Name = "orderItemId")]
        public string OrderItemId { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "reason")]
        public string Reason { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "quantityReceived")]
        public int QuantityReceived { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "quantityShipped")]
        public int QuantityShipped { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "quantityRestockable")]
        public int QuantityRestockable { get; set; }


        [DataMember(EmitDefaultValue = false, Name = "notes")]
        public List<OrderNote> Notes { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "quantity")]
        public int Quantity { get; set; }
    }

    [DataContract(Namespace = "Mozu.services.contracts")]
    public class ReturnAction
    {
        [DataMember(EmitDefaultValue = false, Name = "actionName")]
        public string ActionName { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "returnIds")]
        public List<string> ReturnIds { get; set; }
    }

    //[DataContract(Namespace = "Mozu.services.contracts")]
    //public class ReturnUnitPrice
    //{
    //    [DataMember(EmitDefaultValue = false, Name = "taxableAmount")]
    //    public Decimal? TaxableAmount { get; set; }

    //    [DataMember(EmitDefaultValue = false, Name = "shippingAmount")]
    //    public Decimal? ShippingAmount { get; set; }

    //    [DataMember(EmitDefaultValue = false, Name = "itemTaxAmount")]
    //    public Decimal? ItemTaxAmount { get; set; }

    //    [DataMember(EmitDefaultValue = false, Name = "shippingTaxAmount")]
    //    public Decimal? ShippingTaxAmount { get; set; }
    //}

    [DataContract(Namespace = "Mozu.services.contracts")]
    public class OrderNote
    {
        [DataMember(EmitDefaultValue = false, Name = "id")]
        public string Id { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "text")]
        public string Text { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "updateDate")]
        public DateTime? UpdateDate { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "createDate")]
        public DateTime? CreateDate { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "updateBy")]
        public string UpdateBy { get; set; }

        [DataMember(EmitDefaultValue = false, Name = "createBy")]
        public string CreateBy { get; set; }
    }
}