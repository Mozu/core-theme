using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// Request Location
    /// </summary>
    [DataContract]
  public class RequestLocation {
    /// <summary>
    /// Unit of distance used for radius
    /// </summary>
    /// <value>Unit of distance used for radius</value>
    [DataMember(Name="unit", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "unit")]
    public string Unit { get; set; }

    /// <summary>
    /// Distance from location
    /// </summary>
    /// <value>Distance from location</value>
    [DataMember(Name="radius", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "radius")]
    public decimal Radius { get; set; }

    /// <summary>
    /// Postal Code of this location
    /// </summary>
    /// <value>Postal Code of this location</value>
    [DataMember(Name="postalCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "postalCode")]
    public string PostalCode { get; set; }

    /// <summary>
    /// Latitude coordinate of this location
    /// </summary>
    /// <value>Latitude coordinate of this location</value>
    [DataMember(Name="latitude", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "latitude")]
    public decimal Latitude { get; set; }

    /// <summary>
    /// Longitude coordinate of this location
    /// </summary>
    /// <value>Longitude coordinate of this location</value>
    [DataMember(Name="longitude", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "longitude")]
    public decimal Longitude { get; set; }

    /// <summary>
    /// Country Code for this location
    /// </summary>
    /// <value>Country Code for this location</value>
    [DataMember(Name="countryCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "countryCode")]
    public string CountryCode { get; set; }

    /// <summary>
    /// Location Code for this location. This being set will trigger GetInventoryByLocation
    /// </summary>
    /// <value>Location Code for this location. This being set will trigger GetInventoryByLocation</value>
    [DataMember(Name="locationCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationCode")]
    public string LocationCode { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class RequestLocation {\n");
      sb.Append("  Unit: ").Append(Unit).Append("\n");
      sb.Append("  Radius: ").Append(Radius).Append("\n");
      sb.Append("  PostalCode: ").Append(PostalCode).Append("\n");
      sb.Append("  Latitude: ").Append(Latitude).Append("\n");
      sb.Append("  Longitude: ").Append(Longitude).Append("\n");
      sb.Append("  CountryCode: ").Append(CountryCode).Append("\n");
      sb.Append("  LocationCode: ").Append(LocationCode).Append("\n");
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
