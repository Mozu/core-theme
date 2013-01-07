using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace Mozu.SiteBuilder.UX.Models
{

    [DataContract()]
    public class MessageContainerCollection
    {
        [DataMember(Name = "messages")]
        public List<MessageContainer> Messages { get; set; }
    }

    [DataContract()]
    public class MessageContainer
    {
        [DataMember(Name ="message")]
        public string Message { get; set; }
        [DataMember(Name = "stack")]
        public string Stack { get; set; }
    }
}
