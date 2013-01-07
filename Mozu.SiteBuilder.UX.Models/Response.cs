using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Models
{
    [DataContract]
    public class Response<T> : ModelBase
    {
        [DataMember(Name = "message")]
        public string Message { get; set; }

        [DataMember(Name = "errors", EmitDefaultValue = false)]
        public ErrorCollection ServiceErrorCollection { get; set; }


        [DataMember(Name = "success")]
        public bool Success { get; set; }

      
        [DataMember(Name = "data")]
        public T Data { get; set; }




    }
}
