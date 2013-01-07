using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Shipping
{
    [DataContract]
    public class SiteShippingOriginAddress
    {
        [DataMember(Name = "id")]
        public int? Id { get; set; }

        [DataMember(Name = "senderName")]
        public string SenderName { get; set; }

        [DataMember(Name = "address1")]
        public string Address1 { get; set; }

        [DataMember(Name = "address2")]
        public string Address2 { get; set; }

        [DataMember(Name = "address3")]
        public string Address3 { get; set; }

        [DataMember(Name = "cityOrTown")]
        public string CityOrTown { get; set; }

        [DataMember(Name = "stateOrProvince")]
        public string StateOrProvince { get; set; }

        [DataMember(Name = "country")]
        public string Country { get; set; }

        [DataMember(Name = "postalOrZipCode")]
        public string PostalOrZipCode { get; set; }

        [DataMember(Name = "createBy")]
        public string CreateBy { get; set; }

        [DataMember(Name = "createDate")]
        public DateTime? CreateDate { get; set; }

        [DataMember(Name = "updateBy")]
        public string UpdateBy { get; set; }

        [DataMember(Name = "updateDate")]
        public DateTime? UpdateDate { get; set; }
    }
}