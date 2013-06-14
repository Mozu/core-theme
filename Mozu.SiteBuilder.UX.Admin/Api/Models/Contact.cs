using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    [DataContract]
    public class Contact
    {
		/// <summary>
		/// Contact Identifier
		/// </summary>
        [DataMember(Name = "id")]
        public int? Id { get; set; }

		/// <summary>
		/// Email address
		/// </summary>
		[DataMember(Name="email")]
		public string Email { get; set; }

        /// <summary>
        /// First name
        /// </summary>
        [DataMember(Name = "firstName")]
        public string FirstName { get; set; }

        /// <summary>
        /// Middle name (or initial)
        /// </summary>
        [DataMember(Name = "middleName")]
        public string MiddleName { get; set; }

        /// <summary>
        /// Last name
        /// </summary>
        [DataMember(Name = "lastName")]
        public string LastName { get; set; }

		/// <summary>
		/// CompanyOrOrganization
		/// </summary>
		[DataMember(Name="companyName")]
		public string CompanyOrOrganization { get; set; }

        #region Address
        [DataMember(Name="address1")]
        public string Address1 { get; set; }

        [DataMember(Name="address2")]
        public string Address2 { get; set; }

        [DataMember(Name="address3")]
        public string Address3 { get; set; }

        [DataMember(Name="address4")]
        public string Address4 { get; set; }

        [DataMember(Name="cityOrTown")]
        public string CityOrTown { get; set; }

        [DataMember(Name="countryCode")]
        public string CountryCode { get; set; }

        [DataMember(Name="zipCode")]
        public string PostalOrZipCode { get; set; }

        [DataMember(Name="state")]
        public string StateOrProvince { get; set; }
        #endregion

        #region Phone Numbers
		/// <summary>
		/// Home phone number
		/// </summary>
		[DataMember(Name="homePhone")]
		public string HomePhone { get; set; }

		/// <summary>
		/// Mobile phone number
		/// </summary>
		[DataMember(Name="mobilePhone")]
		public string MobilePhone { get; set; }

		/// <summary>
		/// Work phone number
		/// </summary>
		[DataMember(Name="workPhone")]
		public string WorkPhone { get; set; }
        #endregion
    }
}
