using System;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    [DataContract]
    public class UserSystemData
    {
        [DataMember(Name = "isPasswordChangeRequired")]
        public bool IsPasswordChangeRequired { get; set; }

        [DataMember(Name = "lastPasswordChangeOn")]
        public DateTime? LastPasswordChangeOn { get; set; }

        [DataMember(Name = "isLocked")]
        public bool IsLocked { get; set; }

        [DataMember(Name = "lastLockedOn")]
        public DateTime? LastLockedOn { get; set; }

        [DataMember(Name = "failedLoginAttemptCount")]
        public byte FailedLoginAttemptCount { get; set; }

        [DataMember(Name = "remainingLoginAttempts")]
        public int RemainingLoginAttempts { get; set; }

        [DataMember(Name = "firstFailedLoginAttemptOn")]
        public DateTime? FirstFailedLoginAttemptOn { get; set; }

        [DataMember(Name = "lastLoginOn")]
        public DateTime? LastLoginOn { get; set; }

        [DataMember(Name = "createdOn")]
        public DateTime? CreatedOn { get; set; }

        [DataMember(Name = "updatedOn")]
        public DateTime? UpdatedOn { get; set; }
    }
}