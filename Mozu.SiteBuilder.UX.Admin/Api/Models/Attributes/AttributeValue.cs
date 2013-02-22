using System;
using System.Runtime.Serialization;

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
                    _id = Value.ToString();
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