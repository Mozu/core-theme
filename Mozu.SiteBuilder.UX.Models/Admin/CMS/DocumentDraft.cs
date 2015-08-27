using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Admin.CMS
{
    /// <summary>
    /// Contains metadata about an unpublished CMS document.
    /// </summary>
    [DataContract]
    public class DocumentDraft
    {
        /// <summary>
        /// Document id.
        /// </summary>
        [DataMember(Name = "id")]
        public string Id { get; set; }

        /// <summary>
        /// Draft type, e.g. "Page" or "Template".
        /// </summary>
        [DataMember(Name = "draftType")]
        public string DraftType { get; set; }

        /// <summary>
        /// The document list name.
        /// </summary>
        [DataMember(Name = "listFQN")]
        public string ListFQN { get; set; }

        /// <summary>
        /// Document name.
        /// </summary>
        [DataMember(Name = "name")]
        public string Name { get; set; }

        /// <summary>
        /// Used to initate a publish action.
        /// The client can "update" the model with IsPublished=true to publish the draft.
        /// </summary>
        [DataMember(Name = "isPublished")]
        public bool IsPublished { get; set; }

        /// <summary>
        /// Modification type, e.g. "Updated", "Created" or "Deleted".
        /// </summary>
        [DataMember(Name = "modificationType")]
        public string ModificationType { get; set; }

        /// <summary>
        /// Date of modification.
        /// </summary>
        [DataMember(Name = "lastModified")]
        public DateTime LastModified { get; set; }

        /// <summary>
        /// Name of user who last modified this draft.
        /// </summary>
        [DataMember(Name = "modifiedBy")]
        public string ModifiedBy { get; set; }

        /// <summary>
        /// Last publication date.
        /// </summary>
        [DataMember(Name = "lastPublished")]
        public DateTime LastPublished { get; set; }
    }
}
