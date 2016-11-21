using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Linq;
using Mozu.SiteBuilder.UX.Models.Navigation;

namespace Mozu.SiteBuilder.Mvc.Navigation
{
    /// <summary>
    /// Wrapper around a list of navigation nodes with a custom serializer.
    /// Used by NavigationRepository to persist the navigation set.
    /// TODO: fhersey Remove this class completely and put its serializer inside of NavigationRepository.
    /// </summary>
    [DataContract, Newtonsoft.Json.JsonConverter(typeof(Converter))]
    internal class NavigationSet : List<INavigationNode>
    {
        public string ETag { get; set; }

        /// <summary>
        /// Custom serializer for NavigationSet
        /// </summary>
        public class Converter : Newtonsoft.Json.JsonConverter
        {
            public override bool CanConvert(Type objectType)
            {
                return objectType == typeof(NavigationSet);
            }

            public override object ReadJson(Newtonsoft.Json.JsonReader reader, Type objectType, object existingValue, Newtonsoft.Json.JsonSerializer serializer)
            {
                // we have to read two types of documents:
                // the old style, { nodes: [<node>,<node>] }
                // and the new style, [<node>,<node>]
                if (reader.TokenType == Newtonsoft.Json.JsonToken.Null)
                {
                    return null;
                }
                var set = new NavigationSet();
                var list = new List<SimpleTreeNavigationNode>();
                // fast-forward to the array of nodes
                while ( reader.TokenType != Newtonsoft.Json.JsonToken.StartArray && reader.Read() ) ;
                if (reader.TokenType != Newtonsoft.Json.JsonToken.None)
                {
                    serializer.Populate(reader, list);
                    // read to end
                    while (reader.Read()) ;
                }

                // ensure that all nodes have a .OriginalId
                list.ForEach(nn => {
                    if (nn != null && String.IsNullOrEmpty(nn.OriginalId) && !String.IsNullOrEmpty(nn.Id))
                    {
                        string[] idParts = nn.Id.Split(new string[] { "^^" }, StringSplitOptions.None);
                        if (nn.NodeType != null && nn.NodeType.IsPage && idParts.Length >= 3)
                            nn.OriginalId = idParts[2];
                        else
                            nn.OriginalId = idParts.Last();
                    }
                });
                set.AddRange(list);
                return set;
            }

            public override void WriteJson(Newtonsoft.Json.JsonWriter writer, object value, Newtonsoft.Json.JsonSerializer serializer)
            {
                var set = value as NavigationSet;
                var ser = Newtonsoft.Json.JsonSerializer.CreateDefault();

                if (set == null) {
                    writer.WriteNull();
                    return;
                }

                writer.WriteStartArray();
                
                    foreach (var item in set) {
                        ser.Serialize(writer, item);
                    }

                writer.WriteEndArray();
            }
        }
    }
}