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
  public class SuggestionResponse {
    /// <summary>
    /// Gets or Sets AssignmentSuggestions
    /// </summary>
    [DataMember(Name="assignmentSuggestions", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "assignmentSuggestions")]
    public Dictionary<string, List<AssignmentSuggestion>> AssignmentSuggestions { get; set; }

    /// <summary>
    /// Gets or Sets AvailableLocations
    /// </summary>
    [DataMember(Name="availableLocations", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "availableLocations")]
    public List<int?> AvailableLocations { get; set; }

    /// <summary>
    /// Gets or Sets ExternalResponseID
    /// </summary>
    [DataMember(Name="externalResponseID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "externalResponseID")]
    public string ExternalResponseID { get; set; }

    /// <summary>
    /// Gets or Sets ResponseID
    /// </summary>
    [DataMember(Name="responseID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "responseID")]
    public int? ResponseID { get; set; }

    /// <summary>
    /// Gets or Sets StateChangeSuggestions
    /// </summary>
    [DataMember(Name="stateChangeSuggestions", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "stateChangeSuggestions")]
    public Dictionary<string, StateChangeSuggestion> StateChangeSuggestions { get; set; }

    /// <summary>
    /// Gets or Sets SuggestionLog
    /// </summary>
    [DataMember(Name="suggestionLog", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "suggestionLog")]
    public SuggestionLog SuggestionLog { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class SuggestionResponse {\n");
      sb.Append("  AssignmentSuggestions: ").Append(AssignmentSuggestions).Append("\n");
      sb.Append("  AvailableLocations: ").Append(AvailableLocations).Append("\n");
      sb.Append("  ExternalResponseID: ").Append(ExternalResponseID).Append("\n");
      sb.Append("  ResponseID: ").Append(ResponseID).Append("\n");
      sb.Append("  StateChangeSuggestions: ").Append(StateChangeSuggestions).Append("\n");
      sb.Append("  SuggestionLog: ").Append(SuggestionLog).Append("\n");
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
