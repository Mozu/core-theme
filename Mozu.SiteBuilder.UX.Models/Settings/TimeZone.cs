using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Settings
{
    [DataContract]
    public class TimeZone
    {
        [DataMember(Name = "name")]
        [System.Text.Json.Serialization.JsonPropertyName("name")]
        public string Id { get; set; }

        [DataMember(Name = "offset")]
        public double Offset { get; set; }

        [DataMember(Name = "isDaylightSavings")]
        [System.Text.Json.Serialization.JsonPropertyName("isDaylightSavings")]

        public bool IsDaylightSavingsTime { get; set; }

        [DataMember(Name = "selected")]
        public bool Selected { get; set; }
    }
}