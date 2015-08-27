using System;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    
    public class CustomerContact : Contact
    {
		/// <summary>
		/// Customer Account Identifier
		/// </summary>
        public int? AccountId { get; set; }

        /// <summary>
        /// Customer Account Identifier
        /// </summary>
        public string FaxNumber { get; set; }

        public bool IsShipping { get; set; }

        public bool IsPrimaryShipping { get; set; }

        public bool IsBilling { get; set; }

        public bool IsPrimaryBilling { get; set; }
    }
}
