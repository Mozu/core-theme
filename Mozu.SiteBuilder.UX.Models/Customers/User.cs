using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace Mozu.SiteBuilder.UX.Models.Customers
{
    [DataContract]
    public class User :ModelBase
    {
        [DataMember(Name = "isAuthenticated")]
        public bool IsAuthenticated { get; set; }
         [DataMember(Name = "userId")]
        public string UserId { get; set; }
         [DataMember(Name = "firstName")]
        public string FirstName { get; set; }
         [DataMember(Name = "lastName")]
        public string LastName { get; set; }
         [DataMember(Name = "email")]
        public string Email { get; set; }

        [DataMember(Name = "isAnonymous")]
         public bool IsAnonymous { get; set; }
         [DataMember(Name = "accountId")]
        public int? AccountId { get; set; }
    }
}
