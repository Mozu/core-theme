using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Visit
{
    [DataContract]
    public class Visit
    {
        
        [DataMember]
        public string VisitId { get; set; }

        [DataMember]
        public string VisitorId { get; set; }

        [DataMember]
        public string UserId { get; set; }

        [DataMember]
        public string UserAgent { get; set; }

        [DataMember]
        public string LandingPage { get; set; }

        [DataMember]
        public bool IsTracked { get; set; }

        [DataMember]
        public bool IsUserTracked { get; set; }

        [IgnoreDataMember]
        [System.Text.Json.Serialization.JsonIgnore]
        public bool IsLanding { get; set; }
    }
}
