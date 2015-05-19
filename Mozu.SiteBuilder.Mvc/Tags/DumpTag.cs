// -----------------------------------------------------------------------
// <copyright file="DumpTag.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using NDjango.Interfaces;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using NDjango.FiltersCS.Compatibility;
using System;

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

            var ss = new CaseInsensitiveJsonSerializerSettings { StringEscapeHandling = StringEscapeHandling.EscapeHtml, NullValueHandling = NullValueHandling.Include };
            var json = JsonConvert.SerializeObject(model, Formatting.None, ss);
            return string.Format("<pre>{0}\r\n{1}</pre>", model.GetType().FullName, json);
        }

        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunc)
        {

            return arguments.Count == 0
                ? Enumerable.Empty<WalkResult>()
                : WalkResultHelpers.Buffer(Process(arguments[0].Value)).ToFSharpList();
        }
    }
}
