using System.Runtime.Serialization;
using Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{
    [DataContract]
    [KnownType(typeof(ErrorCollection))]
    public class Response<T>
    {
        [DataMember(Name = "message")]
        public string Message { get; set; }

        [DataMember(Name = "serviceErrorCollection" , EmitDefaultValue =false )]
        public ErrorCollection ServiceErrorCollection { get; set; }

        [DataMember(Name = "success")]
        public bool Success { get; set; }

        [DataMember(Name = "total")]
        public int Total { get; set; }

        [DataMember(Name = "items")]
        public T Items { get; set; }
    }

    [DataContract]
    public class Response<T,M> : Response<T>
    {
        [DataMember(Name = "metaData", EmitDefaultValue = false)]
        public  M MetaData
        {
            get;set;
        }
    }
}