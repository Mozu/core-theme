using System;
using System.IO;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using NDjango.Interfaces;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Collections.Generic;
using NDjango.FiltersCS.Compatibility;
using System.Reflection;
using Mozu.Core.Settings;

namespace Mozu.SiteBuilder.Mvc.Tags
{
    /// <summary>
    /// used to serialize an object to a script tag to be used by hyprlive
    /// takes 2 indexed paramaters
    /// 1=object
    /// (the object to be serilized)
    /// 2=name
    /// (name of the script id outputted)
    /// example
    /// <code>
    /// {% preload_json model "product" %}
    /// </code>
    /// 
    /// </summary>
    [Name("preload_json")]
    public class PreloadJsonTag : SimpleTagBase
    {
        // we want to use the settings the rest of the site uses, but with additional escape handling.
        private static readonly Lazy<JsonSerializer> lazySer =
            new Lazy<JsonSerializer>(
                () =>
                {
                    var settings = new CaseInsensitiveJsonSerializerSettings
                    {
                        ContractResolver = JsonPreloadeContractResolver.DefaultResolver,
                        StringEscapeHandling = StringEscapeHandling.EscapeHtml
                    };
                    return JsonSerializer.Create(settings);
                });

        protected override IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var model = arguments[0].Value;
            var name = arguments[1].Value;
            using (var container = StringBuilderPool.Default.GetContainer())
            {
                var sb = container.Item;
                sb.AppendFormat(@"<script type=""text/json"" id=""data-mz-preload-{0}"">", name);
                using (var writer = new JsonTextWriter(new StringWriter(sb)))
                {
                    lazySer.Value.Serialize(writer, model);
                }
                sb.Append("</script>");


                return new[] { WalkResultHelpers.Buffer(sb.ToString()) };
            }
        }


        
    }

    public class JsonPreloadeCookieContractResolver : CamelCasePropertyNamesContractResolver
    {
        public static readonly JsonPreloadeCookieContractResolver CookieResolver = new JsonPreloadeCookieContractResolver(true);

        bool _reverse = false;
        private JsonPreloadeCookieContractResolver(bool reverse)
        {
            _reverse = reverse;
        }
        public static bool OmitUserFields
        {
            get { return MozuConfigurationManager.Settings.AppSettingsAsNullableBool("sitebuilder_preload_json_omitUserFields").GetValueOrDefault(true); }
        }
        protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
        {
            JsonProperty property = base.CreateProperty(member, memberSerialization);
            var att = member.GetCustomAttribute<JsonPreloadFilterAttribute>();
            property.Ignored =  property.Ignored || (OmitUserFields && att?.Include == false) || (OmitUserFields && member.DeclaringType == typeof(Mozu.SiteBuilder.UX.Models.Customers.User));
            if (_reverse)
            {
                property.Ignored = !property.Ignored;
            }
            return property;
        }
    }

    public class JsonPreloadeContractResolver : CamelCasePropertyNamesContractResolver
    {
        public static readonly JsonPreloadeContractResolver DefaultResolver = new JsonPreloadeContractResolver(false);

   

        bool _reverse = false;
        private JsonPreloadeContractResolver(bool reverse)
        {
            _reverse = reverse;
        }
        public static bool OmitUserFields
        {
            get { return MozuConfigurationManager.Settings.AppSettingsAsNullableBool("sitebuilder_preload_json_omitUserFields").GetValueOrDefault(true); }
        }
        protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
        {
            JsonProperty property = base.CreateProperty(member, memberSerialization);
            var att = member.GetCustomAttribute<JsonPreloadFilterAttribute>();
            property.Ignored = property.Ignored || (OmitUserFields && att?.Include == false) || (OmitUserFields && member.DeclaringType == typeof(Mozu.SiteBuilder.UX.Models.Customers.User));
            if (_reverse)
            {
                property.Ignored = !property.Ignored;
            }
            return property;
        }
    }

    public class JsonPreloadFilterAttribute : Attribute
    {
        public JsonPreloadFilterAttribute() { }
        public JsonPreloadFilterAttribute(bool include = false)
        {
            Include = include;
        }
        public bool Include { get; set; } = false;
    }
}
