//// -----------------------------------------------------------------------
//// <copyright file="SetVarTag.cs" company="Microsoft">
//// TODO: Update copyright text.
//// </copyright>
//// -----------------------------------------------------------------------

//namespace Mozu.SiteBuilder.Mvc.Tags
//{
//    using System;
//    using System.Collections.Generic;
//    using System.Linq;
//    using System.Text;
//    using Mozu.SiteBuilder.Mvc;
//    using System.Web.Routing;


//    /// <summary>
//    /// TODO: Update summary.
//    /// </summary>
//    /// 
//    [NDjango.ParserNodes.Description("tbd")]
//    [NDjango.Interfaces.Name("set")]
//    public class SetTag : SimpleTagBase
//    {
        

      

//        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
//        {
//            object val = null;
//            if (arguments[0].ArgumentType == TagArgument.ArgumentTypes.ValueArgument)
//            {
//                val = arguments[0].Value;

//            }
//            else
//            {
//                val = arguments.ToRouteValueDictionary(null, "as", null);
//            }

//            context = context.add(new Tuple<string, object>(arguments.Last().TokenValue, val));
//            templateName = null;
//            buffer = null;
//        }
//    }
//}
