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
  public class ShopatronUser {
    /// <summary>
    /// Gets or Sets AccountNonExpired
    /// </summary>
    [DataMember(Name="accountNonExpired", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "accountNonExpired")]
    public bool? AccountNonExpired { get; set; }

    /// <summary>
    /// Gets or Sets AccountNonLocked
    /// </summary>
    [DataMember(Name="accountNonLocked", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "accountNonLocked")]
    public bool? AccountNonLocked { get; set; }

    /// <summary>
    /// Gets or Sets AllowedCatalogs
    /// </summary>
    [DataMember(Name="allowedCatalogs", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "allowedCatalogs")]
    public List<int?> AllowedCatalogs { get; set; }

    /// <summary>
    /// Gets or Sets Authorities
    /// </summary>
    [DataMember(Name="authorities", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "authorities")]
    public List<GrantedAuthority> Authorities { get; set; }

    /// <summary>
    /// Gets or Sets CatalogId
    /// </summary>
    [DataMember(Name="catalogId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "catalogId")]
    public int? CatalogId { get; set; }

    /// <summary>
    /// Gets or Sets CredentialsNonExpired
    /// </summary>
    [DataMember(Name="credentialsNonExpired", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "credentialsNonExpired")]
    public bool? CredentialsNonExpired { get; set; }

    /// <summary>
    /// Gets or Sets Email
    /// </summary>
    [DataMember(Name="email", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "email")]
    public string Email { get; set; }

    /// <summary>
    /// Gets or Sets EmailMd5
    /// </summary>
    [DataMember(Name="emailMd5", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "emailMd5")]
    public string EmailMd5 { get; set; }

    /// <summary>
    /// Gets or Sets Enabled
    /// </summary>
    [DataMember(Name="enabled", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "enabled")]
    public bool? Enabled { get; set; }

    /// <summary>
    /// Gets or Sets FirstName
    /// </summary>
    [DataMember(Name="firstName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "firstName")]
    public string FirstName { get; set; }

    /// <summary>
    /// Gets or Sets FulfillerId
    /// </summary>
    [DataMember(Name="fulfillerId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "fulfillerId")]
    public int? FulfillerId { get; set; }

    /// <summary>
    /// Gets or Sets LastName
    /// </summary>
    [DataMember(Name="lastName", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "lastName")]
    public string LastName { get; set; }

    /// <summary>
    /// Gets or Sets ManufacturerId
    /// </summary>
    [DataMember(Name="manufacturerId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "manufacturerId")]
    public int? ManufacturerId { get; set; }

    /// <summary>
    /// Gets or Sets Password
    /// </summary>
    [DataMember(Name="password", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "password")]
    public string Password { get; set; }

    /// <summary>
    /// Gets or Sets Permissions
    /// </summary>
    [DataMember(Name="permissions", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "permissions")]
    public List<string> Permissions { get; set; }

    /// <summary>
    /// Gets or Sets RetailerId
    /// </summary>
    [DataMember(Name="retailerId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "retailerId")]
    public int? RetailerId { get; set; }

    /// <summary>
    /// Gets or Sets UserId
    /// </summary>
    [DataMember(Name="userId", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "userId")]
    public int? UserId { get; set; }

    /// <summary>
    /// Gets or Sets Username
    /// </summary>
    [DataMember(Name="username", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "username")]
    public string Username { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class ShopatronUser {\n");
      sb.Append("  AccountNonExpired: ").Append(AccountNonExpired).Append("\n");
      sb.Append("  AccountNonLocked: ").Append(AccountNonLocked).Append("\n");
      sb.Append("  AllowedCatalogs: ").Append(AllowedCatalogs).Append("\n");
      sb.Append("  Authorities: ").Append(Authorities).Append("\n");
      sb.Append("  CatalogId: ").Append(CatalogId).Append("\n");
      sb.Append("  CredentialsNonExpired: ").Append(CredentialsNonExpired).Append("\n");
      sb.Append("  Email: ").Append(Email).Append("\n");
      sb.Append("  EmailMd5: ").Append(EmailMd5).Append("\n");
      sb.Append("  Enabled: ").Append(Enabled).Append("\n");
      sb.Append("  FirstName: ").Append(FirstName).Append("\n");
      sb.Append("  FulfillerId: ").Append(FulfillerId).Append("\n");
      sb.Append("  LastName: ").Append(LastName).Append("\n");
      sb.Append("  ManufacturerId: ").Append(ManufacturerId).Append("\n");
      sb.Append("  Password: ").Append(Password).Append("\n");
      sb.Append("  Permissions: ").Append(Permissions).Append("\n");
      sb.Append("  RetailerId: ").Append(RetailerId).Append("\n");
      sb.Append("  UserId: ").Append(UserId).Append("\n");
      sb.Append("  Username: ").Append(Username).Append("\n");
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
