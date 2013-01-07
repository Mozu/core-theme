using System;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;
using System.Text.RegularExpressions;
using System.Web.Mvc;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    [DataContract]
    public class LoginUser
    {
        public const string PasswordRegex = @"((?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{6,20})";

        [DataMember(Name = "behaviorIds")]
        public short[] BehaviorIds { get; set; }

        [RegularExpression(@"^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$", ErrorMessage = "invalid email")]
        [Required]
        [DataMember(Name = "email")]
        public string EmailAddress { get; set; }

        [RegularExpression(PasswordRegex, ErrorMessage = "minimum 6 character and at least 1 uppercase letter")]
        [Required]
        [DataMember(Name = "password")]
        public string Password { get; set; }

   
        public string ConfirmPassword { get; set; }
     
        [DataMember(Name = "expiration")]
        public DateTime Expiration { get; set; }

        [DataMember(Name = "id")]
        public string Id { get; set; }

        [DataMember(Name = "isAuthenticated")]
        public bool IsAuthenticated { get; set; }

        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "firstName")]
        public string FirstName { get; set; }

        [DataMember(Name = "lastName")]
        public string LastName { get; set; }

        [DataMember(Name = "siteName" )]
        [RegularExpression("^([a-zA-Z0-9-]+)$", ErrorMessage ="invalid name can contain only letters, numbers, and dashes")]
        public string SiteName { get; set; }

        [DataMember(Name = "activity")]
        public UserSystemData SystemData { get; set; }

        [DataMember(Name = "accessLevel")]
        public string AccessLevel { get; set; }

        [DataMember(Name = "invitation")]
        public string Invitation { get; set; }
        [DataMember(Name = "siteId")]
        public int? SiteId { get; set; }
        [DataMember(Name = "tenantId")]
        public int? TenantId { get; set; }
        [DataMember(Name = "confirmationCode")]
        public string ConfirmationCode { get; set; }
    }

    [DataContract]
    public class User
    {
        [DataMember(Name = "behaviorIds")]
        public short[] BehaviorIds { get; set; }

        [DataMember(Name = "email")]
        public string EmailAddress { get; set; }

        [DataMember(Name = "password")]
        public string Password { get; set; }
        
        [DataMember(Name = "expiration")]
        public DateTime Expiration { get; set; }
        
        [DataMember(Name = "id")]
        public string Id { get; set; }
        
        [DataMember(Name = "isAuthenticated")]
        public bool IsAuthenticated { get; set; }
        
        [DataMember(Name = "name")]
        public string Name { get; set; }

        [DataMember(Name = "firstName")]
        public string FirstName { get; set; }

        [DataMember(Name = "lastName")]
        public string LastName { get; set; }
        
        [DataMember(Name = "siteName")]
        public string SiteName { get; set; }

        [DataMember(Name = "activity")]
        public UserSystemData SystemData { get; set; }

        [DataMember(Name = "accessLevel")]
        public string AccessLevel { get; set; }
    }
}