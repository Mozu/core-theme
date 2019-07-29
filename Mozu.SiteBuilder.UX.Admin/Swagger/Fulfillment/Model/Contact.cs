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
  public class Contact {
    /// <summary>
    /// Gets or Sets Address
    /// </summary>
    [DataMember(Name="address", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "address")]
    public Address Address { get; set; }

    /// <summary>
    /// Gets or Sets Attributes
    /// </summary>
    [DataMember(Name="attributes", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "attributes")]
    public Dictionary<string, Object> Attributes { get; set; }

    /// <summary>
    /// Gets or Sets CompanyOrOrganization
    /// </summary>
    [DataMember(Name="companyOrOrganization", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "companyOrOrganization")]
    public string CompanyOrOrganization { get; set; }

    /// <summary>
    /// Gets or Sets Email
    /// </summary>
    [DataMember(Name="email", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "email")]
    public string Email { get; set; }

    /// <summary>
    /// Gets or Sets FirstName
    /// </summary>
    [DataMember(Name="firstName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "firstName")]
    public string FirstName { get; set; }

    /// <summary>
    /// Gets or Sets LastNameOrSurname
    /// </summary>
    [DataMember(Name="lastNameOrSurname", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "lastNameOrSurname")]
    public string LastNameOrSurname { get; set; }

    /// <summary>
    /// Gets or Sets MiddleNameOrInitial
    /// </summary>
    [DataMember(Name="middleNameOrInitial", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "middleNameOrInitial")]
    public string MiddleNameOrInitial { get; set; }

    /// <summary>
    /// Gets or Sets PhoneNumbers
    /// </summary>
    [DataMember(Name="phoneNumbers", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "phoneNumbers")]
    public Phone PhoneNumbers { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class Contact {\n");
      sb.Append("  Address: ").Append(Address).Append("\n");
      sb.Append("  Attributes: ").Append(Attributes).Append("\n");
      sb.Append("  CompanyOrOrganization: ").Append(CompanyOrOrganization).Append("\n");
      sb.Append("  Email: ").Append(Email).Append("\n");
      sb.Append("  FirstName: ").Append(FirstName).Append("\n");
      sb.Append("  LastNameOrSurname: ").Append(LastNameOrSurname).Append("\n");
      sb.Append("  MiddleNameOrInitial: ").Append(MiddleNameOrInitial).Append("\n");
      sb.Append("  PhoneNumbers: ").Append(PhoneNumbers).Append("\n");
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
