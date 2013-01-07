//// -----------------------------------------------------------------------
//// <copyright file="FieldTag.cs" company="Microsoft">
//// TODO: Update copyright text.
//// </copyright>
//// -----------------------------------------------------------------------

//namespace Mozu.SiteBuilder.Mvc.Tags.CMS
//{
//    using System;
//    using System.Collections.Generic;
//    using System.Linq;
//    using System.Text;
//    using NDjango.Compatibility;
//    using System.Web.Mvc;
//    using System.Web.Mvc.Html;
//    using System.Web.Routing;

//    /// <summary>
//    /// TODO: Update summary.
//    /// </summary>
//    /// 
//    [NDjango.ParserNodes.Description("cms_field")]
//    [NDjango.Interfaces.Name("cms_field")]
//    public class CMSFieldTag:SimpleTag
//    {
//        public CMSFieldTag()
//            : base(true , "cms_field", 1)
//        {
            
//        }

        
//        public override string ProcessTag(NDjango.Interfaces.IContext context, string content, object[] parms)
//        {
//            var isEditmode = context.tryfind("iseditmode") != null && (bool)context.tryfind("iseditmode").Value;
//            var fieldName = (string) parms[0];
//            var html = (HtmlHelper)context.tryfind("Html").Value;
            
//            if (isEditmode)
//            {
//                var html2 = new HtmlHelper<ContentService.Contracts.Document >(html.ViewContext, html.ViewDataContainer, html.RouteCollection );
//                var edit = html2.EditorFor(x => x.Properties.FirstOrDefault(_ => string.CompareOrdinal(_.Name, fieldName) == 0),
//                    "entity");
//              //  var edit = html.Editor ( (fieldName, "entity");
//                return edit.ToHtmlString();
                
//            }
            
//            return content;
//        }
//    }
   
//}
