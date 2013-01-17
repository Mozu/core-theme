using System.Collections.Generic;
using System.Runtime.Serialization;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;

namespace Mozu.SiteBuilder.Mvc.Cms
{

   [DataContract(Name = "pageContext")] 
   public class PageContext  
   {
       
       [DataMember(Name = "title")]
       public string Title { get; set; }

       [DataMember(Name = "metaDescription")]
       public string MetaDescription { get; set; }
       [DataMember(Name = "metaTitle")]
       public string MetaTitle { get; set; }

       [DataMember(Name = "productCode")]
       public string ProductCode { get; set; }
       [DataMember(Name = "categoryId")]
       public string CategoryId { get; set; }
       [DataMember(Name = "pageStem")]
       public string PageStem { get; set; }
       [DataMember(Name = "pageType")]
       public string PageType { get; set; }
       [DataMember(Name = "instanceId")]
       public string InstanceId { get; set; }
       [DataMember(Name = "definition")]
       public string DefinitionId { get; set; }
       [DataMember(Name = "collectionId")]
       public string CollectionId { get; set; }
       [DataMember(Name = "documentId")]
       public string DocumentId { get; set; }

       public string Template { get; set; }


       public string PageId { get; set; }

       //List<string> _widgetCreationTags;
       //List<string> _widgetQuery;
       //[DataMember(Name = "widgetQuery")]
       //public List<string> WidgetQuery
       //{
       //    get
       //    {
       //        if (_widgetQuery == null)
       //        {
       //            _widgetQuery = new List<string>();
       //        }
       //        return _widgetQuery;
       //    }
       //    set
       //    {
       //        _widgetQuery = value;
       //    }
       //}

       //[DataMember(Name = "widgetCreationTags")]
       //public List<string> WidgetCreationTags
       //{
       //    get
       //    {
       //        if (_widgetCreationTags == null)
       //        {
       //            _widgetCreationTags = new List<string>();
       //        }
       //        return _widgetCreationTags;
       //    }
       //    set
       //    {
       //        _widgetCreationTags = value;
       //    }
       //}

       string _canonicalUrl;
       [DataMember(Name = "canonicalUrl")]
       public string CanonicalUrl
       {
           get
           {
               if (_canonicalUrl == null)
               {
                   var ctx = System.Web.HttpContext.Current;
                   if (ctx != null)
                   {
                       _canonicalUrl = "http://yourhostnamehere" + ctx.Request.Path;
                   }
               }
               return _canonicalUrl;
           }
           set
           {
               _canonicalUrl = value;
           }
       }


       [DataMember(Name = "wpc")]
       public WidgetPageContext WidgetContext  { get; set; }

      




   }
 }
