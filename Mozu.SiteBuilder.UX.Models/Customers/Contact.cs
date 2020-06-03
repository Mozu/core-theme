using System.Runtime.Serialization;

namespace Mozu.SiteBuilder.UX.Models.Customers
{
    [DataContract]
    public class Contact : ModelBase
    {
        [DataMember(Name = "id")]
        public int? Id { get; set; }

        [DataMember(Name = "firstName")]
        public string FirstName { get; set; }

        [DataMember(Name = "middleName")]
        public string MiddleName
        {
            get { return MiddleNameOrInitial; }
            set { MiddleNameOrInitial = value; }
        }
        [System.Text.Json.Serialization.JsonIgnore]
        public string MiddleNameOrInitial { get; set; }
        [System.Text.Json.Serialization.JsonIgnore]
        public string LastNameOrSurname { get; set; }

        [DataMember(Name = "lastName")]
        public string LastName
        {
            get { return LastNameOrSurname; }
            set { LastNameOrSurname = value; }
        }
        
        [DataMember(Name = "email")]
        public string Email { get; set; }

        [DataMember(Name = "companyOrOrganization")]
        public string CompanyOrOrganization { get; set; }

        [DataMember(Name = "phoneNumbers")]
        public Phone PhoneNumbers { get; set; }

        [DataMember(Name = "address")]
        public Address Address { get; set; }

        [DataMember(Name = "isPrimary")]
        public bool? IsPrimary { get; set; }
    }
}