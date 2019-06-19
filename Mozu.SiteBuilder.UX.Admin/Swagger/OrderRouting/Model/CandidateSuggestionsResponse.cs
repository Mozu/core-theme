using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace IO.Swagger.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class CandidateSuggestionsResponse {
    /// <summary>
    /// Gets or Sets CandidateSuggestions
    /// </summary>
    [DataMember(Name="candidateSuggestions", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "candidateSuggestions")]
    public List<CandidateSuggestion> CandidateSuggestions { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CandidateSuggestionsResponse {\n");
      sb.Append("  CandidateSuggestions: ").Append(CandidateSuggestions).Append("\n");
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
