using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.PublishSets
{
    public class PublishSet
    {
        public string Name { get; set; }
        public string Code { get; set; }
        
        public DateTime? PublishDate { get; set; }
        public int? ProductCount { get; set; }
        public int? ContentCount { get; set; }

        public string Status { get; set; }

        public string Notes { get; set; }
        public AuditInfo AuditInfo { get; set; }
    }

   

    public class PublishSetItem
    {
        public string Id { get; set; }

        public string Type { get; set; }

        /// <summary>
        /// The unique name of the document.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// The full name of the documentType that underlies this document.
        /// </summary>
        public string DocumentTypeFQN { get; set; }

        /// <summary>
        /// The fully qualified name of the documentList to which the document belongs.
        /// </summary>
        public string ListFQN { get; set; }

        /// <summary>
        /// The date and time the document was last published, if any.
        /// </summary>
        public DateTime? ActiveUpdateDate { get; set; }

        /// <summary>
        /// The date and time the document draft was last updated.
        /// </summary>
        public DateTime DraftUpdateDate { get; set; }

        /// <summary>
        /// The date and time the document is scheduled to Publish
        /// </summary>
        public DateTime? PublishDate { get; set; }

        /// <summary>
        /// The date and time the document is was last published
        /// </summary>
        public DateTime? LastPublishDate { get; set; }

        /// <summary>
        /// The userId or applicationId that last updated the draft document.
        /// </summary>
        public string UpdatedBy { get; set; }

        //TODO: jr -- breaking change. these values are upper case but "active" and "draft" are lower case

        /// <summary>
        /// Denotes the type of draft. 
        /// "Created" -- the document has never been published. 
        /// "Updated" -- the document has an "active" version and this is a subsequent draft.
        /// "Deleted" -- the "active" document will be permanently deleted when this draft is published.
        /// </summary>
        public string PublishType { get; set; } //TODO: describe list of valid publish types when documentations system supports it

        public string PublishSetCode { get; set; }

        public string PublishSetName { get; set; }


        public int? MasterCatalogId { get; set; }
        public int? CatalogId { get; set; }
        public int? SiteId { get; set; }
    }
   

}