using System.Text;
using System.Runtime.Serialization;
using Newtonsoft.Json;

namespace Mozu.Inventory.Contracts.Model
{

    /// <summary>
    /// 
    /// </summary>
    [DataContract]
  public class JobQueueResponse : BaseResponse {
    /// <summary>
    /// Internal identifier that uniquely identifies a single job
    /// </summary>
    /// <value>Internal identifier that uniquely identifies a single job</value>
    [DataMember(Name="jobID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "jobID")]
    public int? JobID { get; set; }

    /// <summary>
    /// Unique internal identifier of the tenant that owns the job
    /// </summary>
    /// <value>Unique internal identifier of the tenant that owns the job</value>
    [DataMember(Name="tenantID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "tenantID")]
    public int? TenantID { get; set; }

    /// <summary>
    /// Unique internal Identifier of the owning location
    /// </summary>
    /// <value>Unique internal Identifier of the owning location</value>
    [DataMember(Name="locationID", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "locationID")]
    public int? LocationID { get; set; }

    /// <summary>
    /// Purpose of the job
    /// </summary>
    /// <value>Purpose of the job</value>
    [DataMember(Name="type", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "type")]
    public string Type { get; set; }

    /// <summary>
    /// Time and date the job was added to the queue in ISO8601 format in UTC
    /// </summary>
    /// <value>Time and date the job was added to the queue in ISO8601 format in UTC</value>
    [DataMember(Name="added", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "added")]
    public string Added { get; set; }

    /// <summary>
    /// Time and date the job was started in ISO8601 format in UTC
    /// </summary>
    /// <value>Time and date the job was started in ISO8601 format in UTC</value>
    [DataMember(Name="started", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "started")]
    public string Started { get; set; }

    /// <summary>
    /// Time and date the job was finished in ISO8601 format in UTC
    /// </summary>
    /// <value>Time and date the job was finished in ISO8601 format in UTC</value>
    [DataMember(Name="finished", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "finished")]
    public string Finished { get; set; }

    /// <summary>
    /// The full name of the file that was picked up at the secure droppoint server before being split up by location. Applies only to refresh and adjust jobs created via file fetch process
    /// </summary>
    /// <value>The full name of the file that was picked up at the secure droppoint server before being split up by location. Applies only to refresh and adjust jobs created via file fetch process</value>
    [DataMember(Name="originalFilename", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "originalFilename")]
    public string OriginalFilename { get; set; }

    /// <summary>
    /// True if the job was not created from a fetched file
    /// </summary>
    /// <value>True if the job was not created from a fetched file</value>
    [DataMember(Name="hasData", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "hasData")]
    public bool? HasData { get; set; }

    /// <summary>
    /// The number of items processed, only for job types REFRESH and ADJUST
    /// </summary>
    /// <value>The number of items processed, only for job types REFRESH and ADJUST</value>
    [DataMember(Name="itemCount", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "itemCount")]
    public int? ItemCount { get; set; }

    /// <summary>
    /// Current status of job completion
    /// </summary>
    /// <value>Current status of job completion</value>
    [DataMember(Name="status", EmitDefaultValue=false)]
    [JsonProperty(PropertyName = "status")]
    public string Status { get; set; }


    /// <summary>
    /// Get the string presentation of the object
    /// </summary>
    /// <returns>String presentation of the object</returns>
    public override string ToString()  {
      var sb = new StringBuilder();
      sb.Append("class JobQueueResponse {\n");
      sb.Append("  JobID: ").Append(JobID).Append("\n");
      sb.Append("  TenantID: ").Append(TenantID).Append("\n");
      sb.Append("  LocationID: ").Append(LocationID).Append("\n");
      sb.Append("  Type: ").Append(Type).Append("\n");
      sb.Append("  Added: ").Append(Added).Append("\n");
      sb.Append("  Started: ").Append(Started).Append("\n");
      sb.Append("  Finished: ").Append(Finished).Append("\n");
      sb.Append("  OriginalFilename: ").Append(OriginalFilename).Append("\n");
      sb.Append("  HasData: ").Append(HasData).Append("\n");
      sb.Append("  ItemCount: ").Append(ItemCount).Append("\n");
      sb.Append("  Status: ").Append(Status).Append("\n");
      sb.Append("}\n");
      return sb.ToString();
    }

    /// <summary>
    /// Get the JSON string presentation of the object
    /// </summary>
    /// <returns>JSON string presentation of the object</returns>
    public  new string ToJson() {
      return JsonConvert.SerializeObject(this, Formatting.Indented);
    }

}
}
