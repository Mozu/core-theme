using System;
using System.Linq;
using System.Collections.Generic;
using Magnum.Extensions;
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
                 foreach (var item in themeSettings.InnerDictionary)
                 {
                     writer.WritePropertyName(item.Key );
                     serializer.Serialize(writer, item.Value.Value );
                 }
                 writer.WriteEndObject();

             }
         }

        


        public object this[string id]
        {
            get
            {

                ThemeRuntimeSetting value;
                if (InnerDictionary.TryGetValue(id, out value))
                {
                    return value.Value;
                }
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
         public ThemeRuntimeSettingsCollection(Dictionary<string, ThemeRuntimeSetting> dictionary, byte[] etagBytes, DateTime timeStamp )
         {
             InnerDictionary = dictionary;

             this.TimeStamp = timeStamp;

             this.Etag = etagBytes;

         }



         public byte[] Etag { get; set; }

        public Dictionary<string, ThemeRuntimeSetting> InnerDictionary { get; set; }

        public DateTime TimeStamp { get; set; }
    }
}
