using System;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    
    public class UserSystemData
    {
        public bool IsPasswordChangeRequired { get; set; }

        public DateTime? LastPasswordChangeOn { get; set; }

        public bool IsLocked { get; set; }

        public DateTime? LastLockedOn { get; set; }

        public byte FailedLoginAttemptCount { get; set; }

        public int RemainingLoginAttempts { get; set; }

        public DateTime? FirstFailedLoginAttemptOn { get; set; }

        public DateTime? LastLoginOn { get; set; }

        public DateTime? CreatedOn { get; set; }

        public DateTime? UpdatedOn { get; set; }
    }
}
