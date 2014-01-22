using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    [DataContract]
    public class CustomerContact : Contact
    {
		/// <summary>
		/// Customer Account Identifier
		/// </summary>
        [DataMember(Name = "accountId")]
        public int? AccountId { get; set; }

        /// <summary>
        /// Customer Account Identifier
        /// </summary>
        [DataMember(Name = "faxNumber")]
        public string FaxNumber { get; set; }

        [DataMember(Name = "isShipping")]
        public bool IsShipping { get; set; }

        [DataMember(Name = "isPrimaryShipping")]
        public bool IsPrimaryShipping { get; set; }

        [DataMember(Name = "isBilling")]
        public bool IsBilling { get; set; }

        [DataMember(Name = "isPrimaryBilling")]
        public bool IsPrimaryBilling { get; set; }
    }
}
