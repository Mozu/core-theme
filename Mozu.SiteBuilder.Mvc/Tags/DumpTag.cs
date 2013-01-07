// -----------------------------------------------------------------------
// <copyright file="DumpTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Mozu.SiteBuilder.Mvc.Tags
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Web.Mvc;
    using Newtonsoft.Json;

    
    [NDjango.Interfaces.Name("dump")]
    public class DumpTag : DynamicTagBase
    {

        public MvcHtmlString Process(object model)
        {
            model = model ?? "null";
            string json = JsonConvert.SerializeObject(model, Formatting.Indented );

            return new MvcHtmlString("<pre>" + model.GetType ().FullName +"\r\n" + json + "</pre>");
        }
    }
}
