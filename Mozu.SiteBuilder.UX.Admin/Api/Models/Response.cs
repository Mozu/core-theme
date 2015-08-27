using Newtonsoft.Json;
using Mozu.Core.Api.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models
{

    public class Response<T>
    {
     
        public string Message { get; set; }

  
        public ErrorCollection ServiceErrorCollection { get; set; }

     
        public bool Success { get; set; }

 
        public int Total { get; set; }

   
        public T Items { get; set; }
    }


    public class Response<T,M> : Response<T>
    {
 
        public  M MetaData
        {
            get;set;
        }
    }
}