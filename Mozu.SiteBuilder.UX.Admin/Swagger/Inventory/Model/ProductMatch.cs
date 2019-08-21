using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Product Match
    /// </summary>
    [DataContract]
  public class ProductMatch {
    /// <summary>
    /// How the product matches with the identifier
    /// </summary>
    /// <value>How the product matches with the identifier</value>
    [DataMember(Name="matchType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "matchType")]
    public string MatchType { get; set; }

    /// <summary>
    /// Identifier
    /// </summary>
    /// <value>Identifier</value>
    [DataMember(Name="identifier", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "identifier")]
    public string Identifier { get; set; }

    /// <summary>
    /// Value
    /// </summary>
    /// <value>Value</value>
    [DataMember(Name="value", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "value")]
    public string Value { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ProductMatch {\n");
      sb.Append("  MatchType: ").Append(MatchType).Append("\n");
      sb.Append("  Identifier: ").Append(Identifier).Append("\n");
      sb.Append("  Value: ").Append(Value).Append("\n");
      sb.Append("}\n");
      return sb.ToString();
    }

    /// <summary>
    /// Get the JSON string presentation of the object
    /// </summary>
    /// <returns>JSON string presentation of the object</returns>
    public string ToJson() {
      return JsonConvert.SerializeObject(this, Formatting.Indented);
    }

}
}
