using System;
using System.Runtime.Serialization;
using System.Text.RegularExpressions;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes
{
    [DataContract]
    public class AttributeValue
    {
        private string _id;

        [DataMember(Name = "id")]
        public string Id
        {
            get
            {
                if (String.IsNullOrEmpty(_id))
                    _id = Regex.Replace(Value.ToString(), "[^a-zA-Z0-9]", "_");
                return _id;
            }
            set { _id = value; }
        }

        [DataMember(Name = "attributeFQN")]
        public string AttributeFQN { get; set; }

        [DataMember(Name = "value")]
        public object Value { get; set; }
    }
}