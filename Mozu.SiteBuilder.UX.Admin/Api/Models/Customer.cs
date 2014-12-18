using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Mozu.Core.Api.Contracts.Client;
using Newtonsoft.Json;
using DC = Mozu.Customer.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{

    public class CustomerSegment : Mozu.Customer.Contracts.CustomerSegment 
    {
        
    }

    public class Customer
    {
        /// <summary>
        /// Unique identifier of the customer account, also known as a customer number.
        /// </summary>
        public int? Id { get; set; }

        /// <summary>
        /// Unique identifier of the storefront user account associated with this customer.
        /// </summary>
        public string UserId { get; set; }

        public bool IsAnonymous { get; set; }


        public List<CustomerSegment> Segments { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string UserName { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string FirstName { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string LastName { get; set; }

		[JsonProperty(DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string EmailAddress { get; set; }


        /// <summary>
        /// List of contacts for this customer account. A customer account can have multiple contacts for billing and shipping addresses.
        /// </summary>
        public List<CustomerContact> Contacts { get; set; }
        
        /// <summary>
        /// The company or organization name for a customer account
        /// </summary>
        public string CompanyOrOrganization { get; set; }

        /// <summary>
        /// If true, the customer prefers to receive marketing material such as newsletters or email offers.
        /// </summary>
        public bool AcceptsMarketing { get; set; }

      

        /// <summary>
        /// List of attributes assigned to the customer.
        /// </summary>
        public List<DC.CustomerAttribute> Attributes { get; set; }

        /// <summary>
        /// List of notes for the customer account. Merchants use these internal notes, for example, to make a note of a customer's interests or complaints. 
        /// Notes are available only from the merchant's view, customers cannot view these notes.
        /// </summary>
        // TODO: make this a datamember
        public List<Object> Notes { get; set; }

        /// <summary>
        /// Whether or not this customer is tax exempt.
        /// </summary>
        public bool TaxExempt { get; set; }

        /// <summary>
        /// For tax exempt customers, their tax id.
        /// </summary>
        public string TaxId { get; set; }

        /// <summary>
        /// Total number of customer visits.
        /// </summary>
        public long VisitCount { get; set; }


      

        #region Order Summary
        /// <summary>
        /// Total amount of all orders, including cancellations and refunds.
        /// </summary>
        [JsonProperty(PropertyName="totalSpent")]
        public decimal? TotalOrderAmount { get; set; }

        /// <summary>
        /// Number of orders listed in the order history of a customer account.
        /// </summary>
        public int OrderCount { get; set; }

        /// <summary>
        /// When the last order was placed.
        /// </summary>
        public DateTime? LastOrderDate { get; set; }

        /// <summary>
        /// Number of wishlists listed in the wishlist count of a customer account
        /// </summary>
        public int WishlistCount { get; set; }

        /// <summary>
        /// Create date
        /// </summary>
        public DateTime? CreateDate { get; set; }

        public List<DC.Card> PaymentCards { get; set; }

        #endregion



        public List<int> SegmentIds { get; set; }

        public bool IsLocked { get; set; }
        public bool IsActive { get; set; }
    }
}
