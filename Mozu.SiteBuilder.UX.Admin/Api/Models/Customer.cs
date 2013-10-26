using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    [DataContract]
    public class Customer
    {
        /// <summary>
        /// Unique identifier of the customer account, also known as a customer number.
        /// </summary>
        [DataMember(Name = "id")]
        public string Id { get; set; }

        /// <summary>
        /// Unique identifier of the storefront user account associated with this customer.
        /// </summary>
        [DataMember(Name="userId")]
        public string UserId { get; set; }

        /// <summary>
        /// List of contacts for this customer account. A customer account can have multiple contacts for billing and shipping addresses.
        /// </summary>
        [DataMember(Name = "contacts")]
        public List<Contact> Contacts { get; set; }
        
        /// <summary>
        /// The company or organization name for a customer account
        /// </summary>
        [DataMember(Name="companyOrOrganization")]
        public string CompanyOrOrganization { get; set; }

        /// <summary>
        /// If true, the customer prefers to receive marketing material such as newsletters or email offers.
        /// </summary>
        [DataMember(Name="acceptsMarketing")]
        public bool AcceptsMarketing { get; set; }

        /// <summary>
        /// List of groups assigned to customer accounts to indicate the groups to which they belong. Merchants create groups, for example, to manage discounts or assign VIP status. 
        /// Then they assign the groups to appropriate customer accounts. A customer account can belong to several groups or none at all.
        /// </summary>
        [DataMember(Name="groups")]
        public List<int> Groups { get; set; }

        /// <summary>
        /// List of attributes assigned to the customer.
        /// </summary>
        [DataMember(Name = "attributes")]
        public List<int> Attributes { get; set; }

        /// <summary>
        /// List of notes for the customer account. Merchants use these internal notes, for example, to make a note of a customer's interests or complaints. 
        /// Notes are available only from the merchant's view, customers cannot view these notes.
        /// </summary>
        // TODO: make this a datamember
        public List<Object> Notes { get; set; }

        /// <summary>
        /// Whether or not this customer is tax exempt.
        /// </summary>
        [DataMember(Name = "taxExempt")]
        public bool TaxExempt { get; set; }

        /// <summary>
        /// For tax exempt customers, their tax id.
        /// </summary>
        [DataMember(Name="taxId")]
        public string TaxId { get; set; }

        #region Order Summary
        /// <summary>
        /// Total amount of all orders, including cancellations and refunds.
        /// </summary>
        [DataMember(Name="totalSpent")]
        public decimal? TotalOrderAmount { get; set; }

        /// <summary>
        /// Number of orders listed in the order history of a customer account.
        /// </summary>
        [DataMember(Name="orderCount")]
        public int OrderCount { get; set; }

        /// <summary>
        /// When the last order was placed.
        /// </summary>
        [DataMember(Name="lastOrderDate")]
        public DateTime? LastOrderDate { get; set; }

        /// <summary>
        /// Number of wishlists listed in the wishlist count of a customer account
        /// </summary>
        [DataMember(Name="wishlistCount")]
        public int WishlistCount { get; set; }

        /// <summary>
        /// Create date
        /// </summary>
        [DataMember(Name = "createDate")]
        public DateTime? CreateDate { get; set; }

        #endregion
    }
}
