using System;
using System.Linq;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.Themes
{
     [JsonConverter(typeof(ThemeRuntimeSettingsCollection.ThemeJsonConverter))]
    public class ThemeRuntimeSettingsCollection
    {
         public class ThemeJsonConverter : JsonConverter
         {

             public override bool CanConvert(Type objectType)
             {
                 return true;
             }

             public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
             {
                 throw new NotImplementedException();
             }

             public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
             {
                 var themeSettings = (ThemeRuntimeSettingsCollection) value;
                 writer.WriteStartObject();
                 foreach (var item in themeSettings.Settings)
                 {
                     writer.WritePropertyName(item.Setting.Id);
                     serializer.Serialize(writer, item.Value);
                 }
                 writer.WriteEndObject();

             }
         }

        public List<ThemeRuntimeSetting> Settings { get; set; }

        public object this[string id]
        {
            get
            {
                if (Settings == null)
                    return null;

                if (Settings.Any(s => s.Setting.Id == id))
                    return Settings.First(s => s.Setting.Id == id).Value;

                return null;
            }
        }

        /// <summary>
        /// Public constructor
        /// </summary>
        public ThemeRuntimeSettingsCollection() { }

        /// <summary>
        /// Public constructor
        /// </summary>
        public ThemeRuntimeSettingsCollection(List<ThemeRuntimeSetting> collection)
        {
            Settings = collection;
        }

      
    }
}
