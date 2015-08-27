using System;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    
    public class Contact
    {
		/// <summary>
		/// Contact Identifier
		/// </summary>
        public int? Id { get; set; }

		/// <summary>
		/// Email address
		/// </summary>
		public string Email { get; set; }

        /// <summary>
        /// First name
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// Middle name (or initial)
        /// </summary>
        public string MiddleName { get; set; }

        /// <summary>
        /// Last name
        /// </summary>
        public string LastName { get; set; }

		/// <summary>
		/// CompanyOrOrganization
		/// </summary>
		public string CompanyOrOrganization { get; set; }

        #region Address
        public string Address1 { get; set; }

        public string Address2 { get; set; }

        public string Address3 { get; set; }

        public string Address4 { get; set; }

        public string CityOrTown { get; set; }

        public string CountryCode { get; set; }

        public string PostalOrZipCode { get; set; }

        public string StateOrProvince { get; set; }

        public bool AddressIsValidated { get; set; }

        public string AddressType { get; set; }
        #endregion

        #region Phone Numbers
		/// <summary>
		/// Home phone number
		/// </summary>
		public string HomePhone { get; set; }

		/// <summary>
		/// Mobile phone number
		/// </summary>
		public string MobilePhone { get; set; }

		/// <summary>
		/// Work phone number
		/// </summary>
		public string WorkPhone { get; set; }
        #endregion
    }
}
