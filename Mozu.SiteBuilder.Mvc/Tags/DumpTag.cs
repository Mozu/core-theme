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

    
    [NDjango.Interfaces.Name("dump")]
    public class DumpTag : DynamicTagBase
    {
        private static JsonSerializerSettings jsonSerializerSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            TypeNameHandling = TypeNameHandling.None,
            Formatting = Formatting.Indented 
        };

        private static JsonSerializerSettings caseInsenstiveJsonSerializerSettings = new JsonSerializerSettings
        {
            NullValueHandling = NullValueHandling.Ignore,
            TypeNameHandling = TypeNameHandling.None,
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            Formatting = Formatting.Indented 
        };
        public string Process(object model)
        {
            model = model ?? "null";

            string json = null;
            if (model.GetType().FullName.Contains("SiteBuilder"))
            {
                json=  JsonConvert.SerializeObject(model, Formatting.None, caseInsenstiveJsonSerializerSettings);
            }
            else
            {
                json= JsonConvert.SerializeObject(model, Formatting.None, jsonSerializerSettings);

            }


            return ("<pre>" + model.GetType ().FullName +"\r\n" + json + "</pre>");
        }
    }
}
