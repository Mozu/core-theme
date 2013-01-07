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
    using System.Web;

    
    [NDjango.Interfaces.Name("json_attribute")]
    public class JsonAttributeTag : DynamicTagBase
    {

        public MvcHtmlString Process(object model)
        {
            model = model ?? "null";

            var serialModel = JsonConvert.SerializeObject(model ?? "null", Formatting.None, new JsonSerializerSettings
            {
                DefaultValueHandling = DefaultValueHandling.Ignore,
                NullValueHandling = NullValueHandling.Ignore,
                TypeNameHandling = TypeNameHandling.None
            });
            return new MvcHtmlString(HttpUtility.HtmlAttributeEncode(serialModel));
        }
    }
}
