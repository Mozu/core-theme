// -----------------------------------------------------------------------
// <copyright file="DumpTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using NDjango.Interfaces;
using System;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    /// <summary>
    /// outputs a pre tag around an objects type name and indent formatted json  represention of the value.
    /// <code>{%dump foo %}</code>
    /// </summary>
    [Name("dump")]
    public class DumpTag : SimpleTagBase
    {
        public string Process(object model)
        {
            model = model ?? "null";

            var ss = new CaseInsensitiveJsonSerializerSettings {StringEscapeHandling = StringEscapeHandling.EscapeHtml};
            var json = JsonConvert.SerializeObject(model, Formatting.None, ss);
            return string.Format("<pre>{0}\r\n{1}</pre>", model.GetType().FullName, json);
        }

        protected override ProcessTagResult ProcessTag(ArgumentCollection arguments, IContext context)
        {
            return arguments.Count == 0
                ? new ProcessTagResult(context) {Buffer = String.Empty, Template = String.Empty}
                : new ProcessTagResult(context) {Buffer = Process(arguments[0].Value), Template = String.Empty};
        }
    }
}
