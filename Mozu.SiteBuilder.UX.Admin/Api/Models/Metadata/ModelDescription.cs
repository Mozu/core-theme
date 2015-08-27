using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Json;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Metadata
{
    [DataContract ]
    public class ModelDescription
    {
        public static ModelDescription Create(Type t)
        {
            System.Json.JsonObject dic = new JsonObject();
            var props = System.ComponentModel.TypeDescriptor.GetProperties(t);
            ModelDescription desc = new ModelDescription() { fields = new List<ModelDescriptionField>(), OrigionalType = t ,  modelName = t.Name.Substring (0,1).ToLower ()+ t.Name.Substring (1)};
            foreach (System.ComponentModel.PropertyDescriptor prop in props)
            {
                var att = prop.Attributes.OfType<JsonPropertyAttribute>().FirstOrDefault();
                var propName = (att == null) ? null : att.PropertyName;
                propName = propName ?? prop.Name;
                string typeName = "auto";
                if (prop.PropertyType == typeof(string))
                {
                    typeName = "string";
                }
                else if (prop.PropertyType == typeof(int) || prop.PropertyType == typeof(int?))
                {
                    typeName = "int";
                }
                else if (prop.PropertyType == typeof(float) || prop.PropertyType == typeof(float?))
                {
                    typeName = "float";
                }
                else if (prop.PropertyType == typeof(decimal) || prop.PropertyType == typeof(decimal?))
                {
                    typeName = "float";
                }
                else if (prop.PropertyType == typeof(long) || prop.PropertyType == typeof(long?))
                {
                    typeName = "int";
                }
                else if (prop.PropertyType == typeof(double) || prop.PropertyType == typeof(double?))
                {
                    typeName = "float";
                }
                else if (prop.PropertyType == typeof(bool) || prop.PropertyType == typeof(bool?))
                {
                    typeName = "boolean";
                }
                else if (prop.PropertyType == typeof(DateTime) || prop.PropertyType == typeof(DateTime?))
                {
                    typeName = "date";
                }
                else if (prop.PropertyType == typeof(Guid) || prop.PropertyType == typeof(Guid?))
                {
                    typeName = "string";
                }

                desc.fields.Add(new ModelDescriptionField()
                {
                    name = propName,
                    type = typeName,
                    useNull = true
                });

            }
            return desc;
        }
        [JsonProperty(Order = 1)]
        public List<ModelDescriptionField> fields { get; set; }

        [JsonProperty(Order = 0)]
        public string modelName
        {
            get;
            set;
        }
        [JsonIgnore]
        internal  Type OrigionalType { get; set; }
    }
    public class ModelDescriptionField
    {
        public string name { get; set; }
        public string type { get; set; }
        public bool useNull { get; set; }

    }
}