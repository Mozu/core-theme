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
  public class Address {
    /// <summary>
    /// Gets or Sets Address1
    /// </summary>
    [DataMember(Name="address1", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "address1")]
    public string Address1 { get; set; }

    /// <summary>
    /// Gets or Sets Address2
    /// </summary>
    [DataMember(Name="address2", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "address2")]
    public string Address2 { get; set; }

    /// <summary>
    /// Gets or Sets Address3
    /// </summary>
    [DataMember(Name="address3", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "address3")]
    public string Address3 { get; set; }

    /// <summary>
    /// Gets or Sets Address4
    /// </summary>
    [DataMember(Name="address4", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "address4")]
    public string Address4 { get; set; }

    /// <summary>
    /// Gets or Sets AddressType
    /// </summary>
    [DataMember(Name="addressType", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "addressType")]
    public string AddressType { get; set; }

    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets CityOrTown
    /// </summary>
    [DataMember(Name="cityOrTown", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "cityOrTown")]
    public string CityOrTown { get; set; }

    /// <summary>
    /// Gets or Sets CountryCode
    /// </summary>
    [DataMember(Name="countryCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "countryCode")]
    public string CountryCode { get; set; }

    /// <summary>
    /// Gets or Sets IsValidated
    /// </summary>
    [DataMember(Name="isValidated", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "isValidated")]
    public bool? IsValidated { get; set; }

    /// <summary>
    /// Gets or Sets Latitude
    /// </summary>
    [DataMember(Name="latitude", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "latitude")]
    public string Latitude { get; set; }

    /// <summary>
    /// Gets or Sets Longitude
    /// </summary>
    [DataMember(Name="longitude", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "longitude")]
    public string Longitude { get; set; }

    /// <summary>
    /// Gets or Sets PostalOrZipCode
    /// </summary>
    [DataMember(Name="postalOrZipCode", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "postalOrZipCode")]
    public string PostalOrZipCode { get; set; }

    /// <summary>
    /// Gets or Sets StateOrProvince
    /// </summary>
    [DataMember(Name="stateOrProvince", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "stateOrProvince")]
    public string StateOrProvince { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class Address {\n");
      sb.Append("  Address1: ").Append(Address1).Append("\n");
      sb.Append("  Address2: ").Append(Address2).Append("\n");
      sb.Append("  Address3: ").Append(Address3).Append("\n");
      sb.Append("  Address4: ").Append(Address4).Append("\n");
      sb.Append("  AddressType: ").Append(AddressType).Append("\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  CityOrTown: ").Append(CityOrTown).Append("\n");
      sb.Append("  CountryCode: ").Append(CountryCode).Append("\n");
      sb.Append("  IsValidated: ").Append(IsValidated).Append("\n");
      sb.Append("  Latitude: ").Append(Latitude).Append("\n");
      sb.Append("  Longitude: ").Append(Longitude).Append("\n");
      sb.Append("  PostalOrZipCode: ").Append(PostalOrZipCode).Append("\n");
      sb.Append("  StateOrProvince: ").Append(StateOrProvince).Append("\n");
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
