using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.Runtime.Serialization;
using System.Web.Routing;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
     [DataContract]
    public class RedirectEntry
    {
        [DataMember(Name = "rw",EmitDefaultValue=false, IsRequired=false ,Order =1)]
        public bool? IsRewrite { get; set; }

        [DataMember(Name = "s", EmitDefaultValue = false, IsRequired = true, Order = 1)]
        public string Source { get; set; }

        [DataMember(Name = "d", EmitDefaultValue = false, IsRequired = true, Order = 1)]
        public string Destination { get; set; }
    }
    public class RedirectFormats
    {
        [DataMember(Name = "format", EmitDefaultValue = false, IsRequired = false, Order = 1)]
        public string Format { get; set; }

        [DataMember(Name = "entityType", EmitDefaultValue = false, IsRequired = false, Order = 1)]
        public string EntityType { get; set; }

    }

    //public class SiteRouteHandler : IRouteHandler
    //{
    //    private SiteRouteEntry _entry;

    //    public SiteRouteEntry Entry
    //    {
    //        get
    //        {
    //            return _entry; 
                
    //        }
    //        set { _entry = value; }
    //    }


    //    System.Web.IHttpHandler IRouteHandler.GetHttpHandler(RequestContext requestContext)
    //    {
    //        throw new System.NotImplementedException();
    //    }
    //}


    public enum PageTypes
    {
        documentList,
        documentListView,
        document
    }




    public class SiteRouteEntry
    {
        public int? Index { get; set; }
        public string Name { get; set; }
        public string Template { get; set; }
        [JsonConverter(typeof(StringEnumConverter))]
        public  PageTypes? PageType{ get; set; }
        public string ListViewName { get; set; }
        public string ListName { get; set; }

        public bool? IsCanonical { get; set; }



        

    }

   


}
