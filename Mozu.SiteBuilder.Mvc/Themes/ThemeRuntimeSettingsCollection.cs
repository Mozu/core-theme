using System;
using System.Linq;
using System.Collections.Generic;
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

        public T Get<T>(string key, T fallback = default)
        {
            if ( typeof(T) == typeof(int) || typeof(T) == typeof(int?))
            {
                var i = GetInt(key) ?? (int?)(object)fallback;
                return (T)(object)i;
            }
            var val = this[key];
            if (val is JValue value)
            {
                val = value.Value;
            }
            if (val is T tval)
            {
                return tval;
            }
            return fallback;
        }
        public int? GetInt( string id)
        {
            var val = this[id];
            if (val is JValue jval)
            {
                val = jval.Value;
            }
            if (val is long)
            {
                val = Convert.ToInt32(val);
            }
            switch (val)
            {
                case int ival:
                    return ival;
                case null:
                    return null;
            }

            if ( int.TryParse( val.ToString(), out var ret ))
            {
                return ret;
            }
            return null;
        }


        public object this[string id]
        {
            get
            {
                if (!InnerDictionary.TryGetValue(id, out var value)) return null;
                return value switch
                {
                    long _ => Convert.ToInt32(value),
                    JValue jval => jval.Value,
                    _ => value
                };
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
