using System;
using System.Linq;
using System.Collections.Generic;
using Magnum.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

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
                var valueDic = serializer.Deserialize<Dictionary<string, object>>(reader).ToDictionary(x => x.Key, x => x.Value, StringComparer.OrdinalIgnoreCase);
                
                
               
                var col = new ThemeRuntimeSettingsCollection() { InnerDictionary = valueDic };
                return col;
               
             }

             public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
             {
                 var themeSettings = (ThemeRuntimeSettingsCollection) value;
                serializer.Serialize(writer ,themeSettings.InnerDictionary);
                 //writer.WriteStartObject();
                 //foreach (var item in themeSettings.InnerDictionary)
                 //{
                 //    writer.WritePropertyName(item.Key );
                 //    serializer.Serialize(writer, item.Value.Value );
                 //}
                 //writer.WriteEndObject();

             }
         }

        public T Get<T>(string key, T fallback = default(T))
        {
            if ( typeof(T) == typeof(int) || typeof(T) == typeof(int?))
            {
                int? i = GetInt(key);
                if ( i == null)
                {
                    i = (int?)(object)fallback;
                }
                return (T)(object)i;
            }
            var val = this[key];
            if (val is JValue)
            {
                val = ((JValue)val).Value;
            }
            if (val is T)
            {
                return (T)val;
            }
            return fallback;
        }
        public int? GetInt( string id)
        {
            var val = this[id];
            if ( val is JValue)
            {
                val = ((JValue)val).Value;
            }
            if ( val is int)
            {
                return (int)val;
            }
            if ( val == null)
            {
                return null;
            }
            int ret;
            if ( int.TryParse( val.ToString(), out ret ))
            {
                return ret;
            }
            return null;
            

        }


        public object this[string id]
        {
            get
            {

                object value;
                if (InnerDictionary.TryGetValue(id, out value))
                {
                    
                    if (value is JValue)
                    {
                        return ((JValue)value).Value;
                    }
                    return value;
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
         public ThemeRuntimeSettingsCollection(Dictionary<string, object> dictionary, byte[] etagBytes, DateTime timeStamp )
         {
             InnerDictionary = dictionary;

             this.TimeStamp = timeStamp;

             this.Etag = etagBytes;

         }



         public byte[] Etag { get; set; }

        public Dictionary<string, object> InnerDictionary { get; set; }

        public DateTime TimeStamp { get; set; }
    }
}
