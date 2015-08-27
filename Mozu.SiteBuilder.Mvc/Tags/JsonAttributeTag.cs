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

    using Newtonsoft.Json;
    using System.Web;

    
    /// <summary>
    /// serializes an object to json and encodes it using html attribute encoding
    /// </summary>
    [NDjango.Interfaces.Name("json_attribute")]
    public class JsonAttributeTag : DynamicTagBase
    {

        public string Process(object model)
        {
            model = model ?? "null";

            var serialModel = JsonConvert.SerializeObject(model ?? "null", Formatting.None, new CaseInsensitiveJsonSerializerSettings());
            return  (HttpUtility.HtmlAttributeEncode(serialModel));
        }
    }
}
