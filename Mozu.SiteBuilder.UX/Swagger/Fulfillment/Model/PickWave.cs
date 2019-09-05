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
  public class PickWave {
    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets AuditInfo
    /// </summary>
    [DataMember(Name="auditInfo", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "auditInfo")]
    public AuditInfo AuditInfo { get; set; }

    /// <summary>
    /// Gets or Sets Contents
    /// </summary>
    [DataMember(Name="contents", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "contents")]
    public List<PickWaveContent> Contents { get; set; }

    /// <summary>
    /// Gets or Sets LocationCode
    /// </summary>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }

    /// <summary>
    /// Gets or Sets MaxShipments
    /// </summary>
    [DataMember(Name="maxShipments", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "maxShipments")]
    public int? MaxShipments { get; set; }

    /// <summary>
    /// Gets or Sets PickType
    /// </summary>
    [DataMember(Name="pickType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickType")]
    public string PickType { get; set; }

    /// <summary>
    /// Gets or Sets PickWaveId
    /// </summary>
    [DataMember(Name="pickWaveId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickWaveId")]
    public string PickWaveId { get; set; }

    /// <summary>
    /// Gets or Sets PickWaveNumber
    /// </summary>
    [DataMember(Name="pickWaveNumber", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickWaveNumber")]
    public int? PickWaveNumber { get; set; }

    /// <summary>
    /// Gets or Sets PickWaveStatus
    /// </summary>
    [DataMember(Name="pickWaveStatus", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickWaveStatus")]
    public string PickWaveStatus { get; set; }

    /// <summary>
    /// Gets or Sets ShipmentNumbers
    /// </summary>
    [DataMember(Name="shipmentNumbers", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentNumbers")]
    public List<int?> ShipmentNumbers { get; set; }

    /// <summary>
    /// Gets or Sets ShipmentType
    /// </summary>
    [DataMember(Name="shipmentType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "shipmentType")]
    public string ShipmentType { get; set; }

    /// <summary>
    /// Gets or Sets SiteId
    /// </summary>
    [DataMember(Name="siteId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "siteId")]
    public int? SiteId { get; set; }

    /// <summary>
    /// Gets or Sets TenantId
    /// </summary>
    [DataMember(Name="tenantId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantId")]
    public int? TenantId { get; set; }

    /// <summary>
    /// Gets or Sets UserId
    /// </summary>
    [DataMember(Name="userId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "userId")]
    public string UserId { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class PickWave {\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  AuditInfo: ").Append(AuditInfo).Append("\n");
      sb.Append("  Contents: ").Append(Contents).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  MaxShipments: ").Append(MaxShipments).Append("\n");
      sb.Append("  PickType: ").Append(PickType).Append("\n");
      sb.Append("  PickWaveId: ").Append(PickWaveId).Append("\n");
      sb.Append("  PickWaveNumber: ").Append(PickWaveNumber).Append("\n");
      sb.Append("  PickWaveStatus: ").Append(PickWaveStatus).Append("\n");
      sb.Append("  ShipmentNumbers: ").Append(ShipmentNumbers).Append("\n");
      sb.Append("  ShipmentType: ").Append(ShipmentType).Append("\n");
      sb.Append("  SiteId: ").Append(SiteId).Append("\n");
      sb.Append("  TenantId: ").Append(TenantId).Append("\n");
      sb.Append("  UserId: ").Append(UserId).Append("\n");
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
