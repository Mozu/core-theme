//// -----------------------------------------------------------------------
//// <copyright file="FieldTag.cs" company="Microsoft">
//// TODO: Update copyright text.
//// </copyright>
//// -----------------------------------------------------------------------

//namespace Mozu.SiteBuilder.UX.Tags.CMS
//{
//    using System;
//    using System.Collections.Generic;
//    using System.Linq;
//    using System.Text;
//    using NDjango.Compatibility;
    
    
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
//            : base(true , "cms_field", -1)
//        {
            
//        }

        
//        public override string ProcessTag(NDjango.Interfaces.IContext context, string content, object[] parms)
//        {
//            var isEditmode = context.tryfind("iseditmode") != null && (bool)context.tryfind("iseditmode").Value;
//            var fieldName = (string) parms[0];
          
//            if (isEditmode)
//            {
//                bool showLabel = parms.Length > 1 ? (int) parms[1] ==1: false  ;
//                StringBuilder sb = new StringBuilder();
//             //   var html2 = new HtmlHelper<Document >(html.ViewContext, html.ViewDataContainer, html.RouteCollection );
//               if (showLabel )
//               {
//                var label = html.Label ( "Properties."+ fieldName);
//                   sb.Append ( label.ToHtmlString () );
//                   sb.Append ( "<br />");
//               }

//               var  edit = html.Editor("Properties."+ fieldName);//;, "entity");//"cms/field");
//                sb.Append ( edit.ToHtmlString () );
//                return sb.ToString ();
                
//            }
            
//            return content;
//        }
//    }
   
//}
