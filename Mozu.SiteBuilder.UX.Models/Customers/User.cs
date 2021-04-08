using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using Newtonsoft.Json;

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

        [IgnoreDataMember()]
        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public List<string> Segments { get; set; }

        [DataMember(Name = "behaviors")]
        public List<int> Behaviors { get; set; }

        [DataMember(Name = "isSalesRep")]
        public bool IsSalesRep { get; set; }
    }
}
