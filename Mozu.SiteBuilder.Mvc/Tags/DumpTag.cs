// -----------------------------------------------------------------------
// <copyright file="DumpTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using Newtonsoft.Json.Serialization;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
  
    using Newtonsoft.Json;

    /// <summary>
    /// outputs a pre tag around an objects type name and indent formatted json  represention of the value.
    /// <code>{%dump foo %}</code>
    /// </summary>
    [NDjango.Interfaces.Name("dump")]
    public class DumpTag : SimpleTagBase
    {

        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            buffer = templateName = string.Empty;
            if (arguments.Count == 0)
                return;
            var model = arguments[0].Value;


            buffer = Process(model);





        }
        public string Process(object model)
        {
            model = model ?? "null";

            var ss = new CaseInsensitiveJsonSerializerSettings();
            ss.StringEscapeHandling = StringEscapeHandling.EscapeHtml;
            ;
            string json = JsonConvert.SerializeObject(model, Formatting.None, ss);

            return ("<pre>" + model.GetType ().FullName +"\r\n" + json + "</pre>");
        }
    }
}
