using System;
using System.Collections.Generic;
using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Navigation
{
    [DataContract, Newtonsoft.Json.JsonConverter(typeof(Converter))]
    public class NavigationSet
    {
        public NavigationSet()
        {
            Nodes = new List<ITreeNavigationNode>();
        }

        [DataMember(Name = "nodes", EmitDefaultValue = false)]
        public List<ITreeNavigationNode> Nodes { get; set; }



        private class Converter : Newtonsoft.Json.JsonConverter
        {
            public override bool CanConvert(Type objectType)
            {
                return objectType == typeof(NavigationSet);
            }

            public override object ReadJson(Newtonsoft.Json.JsonReader reader, Type objectType, object existingValue, Newtonsoft.Json.JsonSerializer serializer)
            {
                if (reader.TokenType == Newtonsoft.Json.JsonToken.Null)
                {
                    return null;
                }
                var set = new NavigationSet();
                var list = new List<SuperNavigationNode>();
                // fast-forward to the array of nodes
                while ( reader.TokenType != Newtonsoft.Json.JsonToken.StartArray && reader.Read() ) ;
                if (reader.TokenType != Newtonsoft.Json.JsonToken.None)
                {
                    serializer.Populate(reader, list);
                    // read to end
                    while (reader.Read()) ;
                }

                set.Nodes.AddRange(list);
                return set;
            }

            public override void WriteJson(Newtonsoft.Json.JsonWriter writer, object value, Newtonsoft.Json.JsonSerializer serializer)
            {
                var set = value as NavigationSet;
                if (set == null) {
                    writer.WriteNull();
                    return;
                }
                var j = new Newtonsoft.Json.Linq.JObject();
                j["nodes"] = Newtonsoft.Json.Linq.JArray.FromObject(set.Nodes);
                j.WriteTo(writer);
            }
        }
    }
}