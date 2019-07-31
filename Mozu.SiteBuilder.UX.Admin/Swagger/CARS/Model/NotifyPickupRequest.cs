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
  public class NotifyPickupRequest {
    /// <summary>
    /// Gets or Sets AddressLine1
    /// </summary>
    [DataMember(Name="addressLine1", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "addressLine1")]
    public string AddressLine1 { get; set; }

    /// <summary>
    /// Gets or Sets CanadaPOSTNOTIFYPICKUPMAXADDRESSLENGTH
    /// </summary>
    [DataMember(Name="canada_POST_NOTIFY_PICKUP_MAX_ADDRESS_LENGTH", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "canada_POST_NOTIFY_PICKUP_MAX_ADDRESS_LENGTH")]
    public int? CanadaPOSTNOTIFYPICKUPMAXADDRESSLENGTH { get; set; }

    /// <summary>
    /// Gets or Sets Carrier
    /// </summary>
    [DataMember(Name="carrier", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "carrier")]
    public string Carrier { get; set; }

    /// <summary>
    /// Gets or Sets City
    /// </summary>
    [DataMember(Name="city", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "city")]
    public string City { get; set; }

    /// <summary>
    /// Gets or Sets Company
    /// </summary>
    [DataMember(Name="company", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "company")]
    public string Company { get; set; }

    /// <summary>
    /// Gets or Sets ContactName
    /// </summary>
    [DataMember(Name="contactName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "contactName")]
    public string ContactName { get; set; }

    /// <summary>
    /// Gets or Sets ContactPhone
    /// </summary>
    [DataMember(Name="contactPhone", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "contactPhone")]
    public string ContactPhone { get; set; }

    /// <summary>
    /// Gets or Sets Email
    /// </summary>
    [DataMember(Name="email", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "email")]
    public string Email { get; set; }

    /// <summary>
    /// Gets or Sets LocationCode
    /// </summary>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }

    /// <summary>
    /// Gets or Sets PickupInstructions
    /// </summary>
    [DataMember(Name="pickupInstructions", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickupInstructions")]
    public string PickupInstructions { get; set; }

    /// <summary>
    /// Gets or Sets PickupVolume
    /// </summary>
    [DataMember(Name="pickupVolume", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickupVolume")]
    public string PickupVolume { get; set; }

    /// <summary>
    /// Gets or Sets PostalCode
    /// </summary>
    [DataMember(Name="postalCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "postalCode")]
    public string PostalCode { get; set; }

    /// <summary>
    /// Gets or Sets PriorityFlag
    /// </summary>
    [DataMember(Name="priorityFlag", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "priorityFlag")]
    public bool? PriorityFlag { get; set; }

    /// <summary>
    /// Gets or Sets Province
    /// </summary>
    [DataMember(Name="province", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "province")]
    public string Province { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class NotifyPickupRequest {\n");
      sb.Append("  AddressLine1: ").Append(AddressLine1).Append("\n");
      sb.Append("  CanadaPOSTNOTIFYPICKUPMAXADDRESSLENGTH: ").Append(CanadaPOSTNOTIFYPICKUPMAXADDRESSLENGTH).Append("\n");
      sb.Append("  Carrier: ").Append(Carrier).Append("\n");
      sb.Append("  City: ").Append(City).Append("\n");
      sb.Append("  Company: ").Append(Company).Append("\n");
      sb.Append("  ContactName: ").Append(ContactName).Append("\n");
      sb.Append("  ContactPhone: ").Append(ContactPhone).Append("\n");
      sb.Append("  Email: ").Append(Email).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  PickupInstructions: ").Append(PickupInstructions).Append("\n");
      sb.Append("  PickupVolume: ").Append(PickupVolume).Append("\n");
      sb.Append("  PostalCode: ").Append(PostalCode).Append("\n");
      sb.Append("  PriorityFlag: ").Append(PriorityFlag).Append("\n");
      sb.Append("  Province: ").Append(Province).Append("\n");
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
