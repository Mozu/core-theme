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
  public class CandidateSuggestion {
    /// <summary>
    /// Gets or Sets AddressLine1
    /// </summary>
    [DataMember(Name="addressLine1", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "addressLine1")]
    public string AddressLine1 { get; set; }

    /// <summary>
    /// Gets or Sets AddressLine2
    /// </summary>
    [DataMember(Name="addressLine2", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "addressLine2")]
    public string AddressLine2 { get; set; }

    /// <summary>
    /// Gets or Sets AddressLine3
    /// </summary>
    [DataMember(Name="addressLine3", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "addressLine3")]
    public string AddressLine3 { get; set; }

    /// <summary>
    /// Gets or Sets City
    /// </summary>
    [DataMember(Name="city", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "city")]
    public string City { get; set; }

    /// <summary>
    /// Gets or Sets CountryCode
    /// </summary>
    [DataMember(Name="countryCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "countryCode")]
    public string CountryCode { get; set; }

    /// <summary>
    /// Gets or Sets DirectShip
    /// </summary>
    [DataMember(Name="directShip", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "directShip")]
    public bool? DirectShip { get; set; }

    /// <summary>
    /// Gets or Sets Distance
    /// </summary>
    [DataMember(Name="distance", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "distance")]
    public string Distance { get; set; }

    /// <summary>
    /// Gets or Sets Express
    /// </summary>
    [DataMember(Name="express", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "express")]
    public bool? Express { get; set; }

    /// <summary>
    /// Gets or Sets Inventory
    /// </summary>
    [DataMember(Name="inventory", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "inventory")]
    public List<CandidateSuggestionInventory> Inventory { get; set; }

    /// <summary>
    /// Gets or Sets Latitude
    /// </summary>
    [DataMember(Name="latitude", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "latitude")]
    public double? Latitude { get; set; }

    /// <summary>
    /// Gets or Sets LocationCode
    /// </summary>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }

    /// <summary>
    /// Gets or Sets LocationName
    /// </summary>
    [DataMember(Name="locationName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationName")]
    public string LocationName { get; set; }

    /// <summary>
    /// Gets or Sets Longitude
    /// </summary>
    [DataMember(Name="longitude", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "longitude")]
    public double? Longitude { get; set; }

    /// <summary>
    /// Gets or Sets Pickup
    /// </summary>
    [DataMember(Name="pickup", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "pickup")]
    public bool? Pickup { get; set; }

    /// <summary>
    /// Gets or Sets PostalCode
    /// </summary>
    [DataMember(Name="postalCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "postalCode")]
    public string PostalCode { get; set; }

    /// <summary>
    /// Gets or Sets State
    /// </summary>
    [DataMember(Name="state", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "state")]
    public string State { get; set; }

    /// <summary>
    /// Gets or Sets TransferEnabled
    /// </summary>
    [DataMember(Name="transferEnabled", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "transferEnabled")]
    public bool? TransferEnabled { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class CandidateSuggestion {\n");
      sb.Append("  AddressLine1: ").Append(AddressLine1).Append("\n");
      sb.Append("  AddressLine2: ").Append(AddressLine2).Append("\n");
      sb.Append("  AddressLine3: ").Append(AddressLine3).Append("\n");
      sb.Append("  City: ").Append(City).Append("\n");
      sb.Append("  CountryCode: ").Append(CountryCode).Append("\n");
      sb.Append("  DirectShip: ").Append(DirectShip).Append("\n");
      sb.Append("  Distance: ").Append(Distance).Append("\n");
      sb.Append("  Express: ").Append(Express).Append("\n");
      sb.Append("  Inventory: ").Append(Inventory).Append("\n");
      sb.Append("  Latitude: ").Append(Latitude).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
      sb.Append("  LocationName: ").Append(LocationName).Append("\n");
      sb.Append("  Longitude: ").Append(Longitude).Append("\n");
      sb.Append("  Pickup: ").Append(Pickup).Append("\n");
      sb.Append("  PostalCode: ").Append(PostalCode).Append("\n");
      sb.Append("  State: ").Append(State).Append("\n");
      sb.Append("  TransferEnabled: ").Append(TransferEnabled).Append("\n");
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
