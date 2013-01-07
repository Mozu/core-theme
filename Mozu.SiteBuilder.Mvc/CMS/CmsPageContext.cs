//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Web.Routing;
//using System.Runtime.Serialization;
//using System.Json;
//using Mozu.SiteBuilder.Mvc.Models.CMS;

//namespace Mozu.SiteBuilder.Mvc.Cms
//{

//   [DataContract(Name = "pageContext")] 
//   public class PageContext  
//   {
//       [DataMember(Name = "title")]
//       public string Title { get; set; }

//       [DataMember(Name = "metaDescription")]
//       public string MetaDescription { get; set; }
//       [DataMember(Name = "metaTitle")]
//       public string MetaTitle { get; set; }

//       [DataMember(Name = "productCode")]
//       public string ProductCode { get; set; }
//       [DataMember(Name = "categoryId")]
//       public string CategoryId { get; set; }
//       [DataMember(Name = "pageStem")]
//       public string PageStem { get; set; }
//       [DataMember(Name = "pageType")]
//       public string PageType { get; set; }
//       [DataMember(Name = "instanceId")]
//       public string InstanceId { get; set; }
//       [DataMember(Name = "definition")]
//       public string DefinitionId { get; set; }
//       [DataMember(Name = "collectionId")]
//       public string CollectionId { get; set; }
//       [DataMember(Name = "documentId")]
//       public string DocumentId { get; set; }

//       string _canonicalUrl;
//       [DataMember(Name = "canonicalUrl")]
//       public string CanonicalUrl
//       {
//           get
//           {
//               if (_canonicalUrl == null)
//               {
//                   var ctx = System.Web.HttpContext.Current;
//                   if (ctx != null)
//                   {
//                       _canonicalUrl = "http://yourhostnamehere" + ctx.Request.Path;
//                   }
//               }
//               return _canonicalUrl;
//           }
//           set
//           {
//               _canonicalUrl = value;
//           }
//       }


//       [IgnoreDataMember ()]
//       public List<WidgetInstance> Widgets { get; set; }
//   }
// }
