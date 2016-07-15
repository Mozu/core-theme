using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;
using Mozu.Customer.Contracts;
namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    public class CustomerAuditEntry
    {
        /// <summary>
        /// Customer associated with this entry
        /// </summary>
        public int CustomerAccountId { get; set; }

        /// <summary>
        /// Id of this entry
        /// </summary>
        public int CustomerAuditEntryId { get; set; }

        /// <summary>
        /// Date of the Entry
        /// </summary>
        public DateTime EntryDate { get; set; }

        /// <summary>
        /// User ID associated with this Entry
        /// </summary>
        public string EntryUser { get; set; }

        /// <summary>
        /// Applicattion associated with this entry
        /// </summary>
        public string Application { get; set; }

        /// <summary>
        /// Site associated wit this entry
        /// </summary>
        public string Site { get; set; }

        /// <summary>
        /// Description of the change (UI Displayable)
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Path of the field value being changed (e.g. /Customer/Contacts/1/FirstName)
        /// </summary>
        public string FieldPath { get; set; }

        /// <summary>
        /// Original value before this event
        /// </summary>
        public string OldValue { get; set; }

        /// <summary>
        /// New Value after this event
        /// </summary>
        public string NewValue { get; set; }

    }
}