using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.CARS.Contracts.Model {

  /// <summary>
  /// 
  /// </summary>
  [DataContract]
  public class CarrierClientSchema {
    /// <summary>
    /// Gets or Sets Carrier
    /// </summary>
    [DataMember(Name="carrier", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "carrier")]
    public string Carrier { get; set; }

    /// <summary>
    /// Gets or Sets CarrierClientSchemaID
    /// </summary>
    [DataMember(Name="carrierClientSchemaID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "carrierClientSchemaID")]
    public long? CarrierClientSchemaID { get; set; }

    /// <summary>
    /// Gets or Sets Configs
    /// </summary>
    [DataMember(Name="configs", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "configs")]
    public CarrierClientConfigs Configs { get; set; }

    /// <summary>
    /// Gets or Sets Created
    /// </summary>
    [DataMember(Name="created", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "created")]
    public DateTime? Created { get; set; }

    /// <summary>
    /// Gets or Sets OperationType
    /// </summary>
    [DataMember(Name="operationType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "operationType")]
    public string OperationType { get; set; }

    /// <summary>
    /// Gets or Sets Schema
    /// </summary>
    [DataMember(Name="schema", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "schema")]
    public string Schema { get; set; }

    /// <summary>
    /// Gets or Sets TenantID
    /// </summary>
    [DataMember(Name="tenantID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantID")]
    public int? TenantID { get; set; }

    /// <summary>
    /// Gets or Sets Valid
    /// </summary>
    [DataMember(Name="valid", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "valid")]
    public bool? Valid { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CarrierClientSchema {\n");
      sb.Append("  Carrier: ").Append(Carrier).Append("\n");
      sb.Append("  CarrierClientSchemaID: ").Append(CarrierClientSchemaID).Append("\n");
      sb.Append("  Configs: ").Append(Configs).Append("\n");
      sb.Append("  Created: ").Append(Created).Append("\n");
      sb.Append("  OperationType: ").Append(OperationType).Append("\n");
      sb.Append("  Schema: ").Append(Schema).Append("\n");
      sb.Append("  TenantID: ").Append(TenantID).Append("\n");
      sb.Append("  Valid: ").Append(Valid).Append("\n");
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
