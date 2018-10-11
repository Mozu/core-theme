using System.Collections.Generic;
using System.Runtime.Serialization;
using DC = Mozu.Customer.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    public class B2BAccountUser
    {
        //
        // Summary:
        //     If true, the customer prefers to receive marketing material such as newsletters
        //     or email offers.
        [DataMember(EmitDefaultValue = false)]
        public bool AcceptsMarketing { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public string EmailAddress { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public string FirstName { get; set; }
        //
        // Summary:
        //     Indicates if an external password is set on this account
        [DataMember]
        public bool HasExternalPassword { get; set; }

        [DataMember]
        public bool IsActive { get; set; }

        [DataMember]
        public bool IsLocked { get; set; }

        [DataMember]
        public bool IsRemoved { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public string LastName { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public string LocaleCode { get; set; }
        //
        // Summary:
        //     Unique identifier of the user who is currently logged in. This is null if the
        //     user is anonymous (not logged in). Unicode data with a maximum length of 55 characters.
        [DataMember]
        public string UserId { get; set; }

        [DataMember(EmitDefaultValue = false)]
        public string UserName { get; set; }

        [DataMember]
        public int Role { get; set; }

        [DataMember]
        public List<Core.Api.Contracts.UserRole> Roles { get; set; }

        [DataMember]
        public int SiteId { get; set; }
    }
}
