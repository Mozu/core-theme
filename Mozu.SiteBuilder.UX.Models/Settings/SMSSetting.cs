using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Models.Settings
{
    public class SMSTypeSettingVM
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

        public bool? OnlyOnApiRequest { get; set; }
    }

    public enum SMSTypes
    {
        ShipmentItemCanceled,
        ShipmentAssigned,
        CustomerAtCurbside,
        CustomerIntransit,
        IntransitConfirmation,
        OrderConfirmation,
        ShipmentConfirmation,
        OrderPickupReady
    };
}

