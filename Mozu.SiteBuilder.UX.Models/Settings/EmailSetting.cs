using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Models.Settings
{
    public class EmailTypeSettingVM
    {
        [JsonProperty(
           DefaultValueHandling = DefaultValueHandling.Include,
           NullValueHandling = NullValueHandling.Include
           )]
        public bool? Enabled { get; set; }

        [JsonProperty(
           DefaultValueHandling = DefaultValueHandling.Include,
           NullValueHandling = NullValueHandling.Include
           )]
        public string Id { get; set; }


        [JsonProperty(
           DefaultValueHandling = DefaultValueHandling.Include,
           NullValueHandling = NullValueHandling.Include
           )]
        public string SenderEmailAddressOverride { get; set; }

        [JsonProperty(
            DefaultValueHandling = DefaultValueHandling.Include,
            NullValueHandling = NullValueHandling.Include
            )]
        public string SenderEmailAliasOverride { get; set; }

        [JsonProperty(
           DefaultValueHandling = DefaultValueHandling.Include,
           NullValueHandling = NullValueHandling.Include
           )]
        public string ReplyToEmailAddressOverride { get; set; }

        [JsonProperty(
            DefaultValueHandling = DefaultValueHandling.Include,
            NullValueHandling = NullValueHandling.Include
            )]
        public string BccEmailAddressOverride { get; set; }

        [JsonProperty(
            DefaultValueHandling = DefaultValueHandling.Include,
            NullValueHandling = NullValueHandling.Include
            )]
        public bool? OnlyOnApiRequest { get; set; }
    }
    public enum EmailTypes
    {

        BackInStock,
        OrderChanged,
        OrderShipped,
        OrderFulfillmentDetailsChanged,
        ShopperLoginCreated,
        ShopperPasswordReset,
        ReturnCreated,
        ReturnAuthorized,
        ReturnUpdated,
        ReturnRejected,
        ReturnCancelled,
        ReturnClosed,
        RefundCreated,
        StoreCreditCreated,
        StoreCreditUpdated,
        GiftCardCreated,
        Backorder,
        //BackorderUpdate,
        ShipmentConfirmation,
        OrderPickupReady,
        OrderPickupReminder,
        ShipmentBackorderDateChanged,
        OrderCancellation,
        ShipmentItemCanceled,
        ShipmentAssigned,
        TransferShipmentCreated,
        TransferShipmentShipped,
        PartialPickupReady,
        TransferShipmentCreatedByFulfiller
    };
}
