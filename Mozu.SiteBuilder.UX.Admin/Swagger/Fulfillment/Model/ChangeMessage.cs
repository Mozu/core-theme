using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Fulfiller.Contracts.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class ChangeMessage {
    /// <summary>
    /// Gets or Sets Amount
    /// </summary>
    [DataMember(Name="amount", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "amount")]
    public decimal Amount { get; set; }

    /// <summary>
    /// Gets or Sets AppId
    /// </summary>
    [DataMember(Name="appId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "appId")]
    public string AppId { get; set; }

    /// <summary>
    /// Gets or Sets AppKey
    /// </summary>
    [DataMember(Name="appKey", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "appKey")]
    public string AppKey { get; set; }

    /// <summary>
    /// Gets or Sets AppName
    /// </summary>
    [DataMember(Name="appName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "appName")]
    public string AppName { get; set; }

    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets ChangeMessageId
    /// </summary>
    [DataMember(Name="changeMessageId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "changeMessageId")]
    public string ChangeMessageId { get; set; }

    /// <summary>
    /// Gets or Sets CorrelationId
    /// </summary>
    [DataMember(Name="correlationId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "correlationId")]
    public string CorrelationId { get; set; }

    /// <summary>
    /// Gets or Sets CreatedDate
    /// </summary>
    [DataMember(Name="createdDate", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "createdDate")]
    public DateTime? CreatedDate { get; set; }

    /// <summary>
    /// Gets or Sets Identifier
    /// </summary>
    [DataMember(Name="identifier", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "identifier")]
    public string Identifier { get; set; }

    /// <summary>
    /// Gets or Sets Message
    /// </summary>
    [DataMember(Name="message", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "message")]
    public string Message { get; set; }

    /// <summary>
    /// Gets or Sets Metadata
    /// </summary>
    [DataMember(Name="metadata", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "metadata")]
    public string Metadata { get; set; }

    /// <summary>
    /// Gets or Sets NewValue
    /// </summary>
    [DataMember(Name="newValue", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "newValue")]
    public string NewValue { get; set; }

    /// <summary>
    /// Gets or Sets OldValue
    /// </summary>
    [DataMember(Name="oldValue", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "oldValue")]
    public string OldValue { get; set; }

    /// <summary>
    /// Gets or Sets Subject
    /// </summary>
    [DataMember(Name="subject", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "subject")]
    public string Subject { get; set; }

    /// <summary>
    /// Gets or Sets SubjectType
    /// </summary>
    [DataMember(Name="subjectType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "subjectType")]
    public string SubjectType { get; set; }

    /// <summary>
    /// Gets or Sets Success
    /// </summary>
    [DataMember(Name="success", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "success")]
    public bool? Success { get; set; }

    /// <summary>
    /// Gets or Sets UserFirstName
    /// </summary>
    [DataMember(Name="userFirstName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "userFirstName")]
    public string UserFirstName { get; set; }

    /// <summary>
    /// Gets or Sets UserId
    /// </summary>
    [DataMember(Name="userId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "userId")]
    public string UserId { get; set; }

    /// <summary>
    /// Gets or Sets UserLastName
    /// </summary>
    [DataMember(Name="userLastName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "userLastName")]
    public string UserLastName { get; set; }

    /// <summary>
    /// Gets or Sets Verb
    /// </summary>
    [DataMember(Name="verb", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "verb")]
    public string Verb { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ChangeMessage {\n");
      sb.Append("  Amount: ").Append(Amount).Append("\n");
      sb.Append("  AppId: ").Append(AppId).Append("\n");
      sb.Append("  AppKey: ").Append(AppKey).Append("\n");
      sb.Append("  AppName: ").Append(AppName).Append("\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  ChangeMessageId: ").Append(ChangeMessageId).Append("\n");
      sb.Append("  CorrelationId: ").Append(CorrelationId).Append("\n");
      sb.Append("  CreatedDate: ").Append(CreatedDate).Append("\n");
      sb.Append("  Identifier: ").Append(Identifier).Append("\n");
      sb.Append("  Message: ").Append(Message).Append("\n");
      sb.Append("  Metadata: ").Append(Metadata).Append("\n");
      sb.Append("  NewValue: ").Append(NewValue).Append("\n");
      sb.Append("  OldValue: ").Append(OldValue).Append("\n");
      sb.Append("  Subject: ").Append(Subject).Append("\n");
      sb.Append("  SubjectType: ").Append(SubjectType).Append("\n");
      sb.Append("  Success: ").Append(Success).Append("\n");
      sb.Append("  UserFirstName: ").Append(UserFirstName).Append("\n");
      sb.Append("  UserId: ").Append(UserId).Append("\n");
      sb.Append("  UserLastName: ").Append(UserLastName).Append("\n");
      sb.Append("  Verb: ").Append(Verb).Append("\n");
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
