using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Checkout
{
    [DataContract ()]
    public class Setting
    {
        [DataMember(Name = "paymentServiceMerchantId")]
        public string PaymentServiceMerchantId { get; set; }

        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "gatewayDefinitionId")]
        public string GatewayDefinitionId { get; set; }

        [DataMember(Name = "supportedCards")]
        public List<string> SupportedCards { get; set; }

        [DataMember(Name = "paymentProcessingFlowType")]
        public string PaymentProcessingFlowType { get; set; }

        [DataMember(Name = "customerCheckoutType")]
        public string CustomerCheckoutType { get; set; }


        [DataMember(Name = "credentials")]
        public Newtonsoft.Json.Linq.JObject Credentials { get; set; }

        //[DataMember(Name = "gatewayFieldVal1")]
        //public string GatewayFieldVal1 { get; set; }

        //[DataMember(Name = "gatewayFieldVal2")]
        //public string GatewayFieldVal2 { get; set; }

        //[DataMember(Name = "gatewayFieldVal3")]
        //public string GatewayFieldVal3 { get; set; }

        //[DataMember(Name = "gatewayFieldVal4")]
        //public string GatewayFieldVal4 { get; set; }

        //[DataMember(Name = "gatewayFieldVal5")]
        //public string GatewayFieldVal5 { get; set; }

        //[DataMember(Name = "gatewayFieldVal6")]
        //public string GatewayFieldVal6 { get; set; }

        //[DataMember(Name = "gatewayFieldVal7")]
        //public string GatewayFieldVal7 { get; set; }

        //[DataMember(Name = "gatewayFieldVal8")]
        //public string GatewayFieldVal8 { get; set; }

        //[DataMember(Name = "gatewayFieldVal9")]
        //public string GatewayFieldVal9 { get; set; }

        //[DataMember(Name = "gatewayFieldVal10")]
        //public string GatewayFieldVal10 { get; set; }
        
        //[DataMember(Name = "gatewayFieldId1")]
        //public string GatewayFieldId1 { get; set; }

        //[DataMember(Name = "gatewayFieldId2")]
        //public string GatewayFieldId2 { get; set; }

        //[DataMember(Name = "gatewayFieldId3")]
        //public string GatewayFieldId3 { get; set; }

        //[DataMember(Name = "gatewayFieldId4")]
        //public string GatewayFieldId4 { get; set; }

        //[DataMember(Name = "gatewayFieldId5")]
        //public string GatewayFieldId5 { get; set; }

        //[DataMember(Name = "gatewayFieldId6")]
        //public string GatewayFieldId6 { get; set; }

        //[DataMember(Name = "gatewayFieldId7")]
        //public string GatewayFieldId7 { get; set; }

        //[DataMember(Name = "gatewayFieldId8")]
        //public string GatewayFieldId8 { get; set; }

        //[DataMember(Name = "gatewayFieldId9")]
        //public string GatewayFieldId9 { get; set; }

        //[DataMember(Name = "gatewayFieldId10")]
        //public string GatewayFieldId10 { get; set; }

        [DataMember(Name = "payByMail")]
        public bool? PayByMail { get; set; }

        [DataMember(Name = "credentialsSet")]
        public bool AreGatewayCredentialFieldsSet { get; set; }
    }
}