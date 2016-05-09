using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Models.Settings
{
    public class EmailTypeSettingVM 
    {
        [Newtonsoft.Json.JsonProperty(DefaultValueHandling = Newtonsoft.Json.DefaultValueHandling.Include)]
        public bool? Enabled { get; set; }

        [Newtonsoft.Json.JsonProperty(DefaultValueHandling = Newtonsoft.Json.DefaultValueHandling.Include)]
        public string Id { get; set; }


        [Newtonsoft.Json.JsonProperty(DefaultValueHandling = Newtonsoft.Json.DefaultValueHandling.Include)]
        public string SenderEmailAddressOverride { get; set; }

        [Newtonsoft.Json.JsonProperty(DefaultValueHandling = Newtonsoft.Json.DefaultValueHandling.Include)]
        public string SenderEmailAliasOverride { get; set; }

        [Newtonsoft.Json.JsonProperty(DefaultValueHandling = Newtonsoft.Json.DefaultValueHandling.Include)]
        public string ReplyToEmailAddressOverride { get; set; }
        
        [Newtonsoft.Json.JsonProperty(DefaultValueHandling = Newtonsoft.Json.DefaultValueHandling.Include)]
        public string BccEmailAddressOverride { get; set; }


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
        GiftCardCreated
    };
}
