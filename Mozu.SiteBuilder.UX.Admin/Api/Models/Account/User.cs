using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;
using System.Text.RegularExpressions;


namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Account
{
    
    public class LoginUser
    {
        public const string PasswordRegex = @"((?=.*\d)(?=.*[A-Z])(?=.*[a-z]).{6,20})";

        public short[] BehaviorIds { get; set; }

        [RegularExpression(@"^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$", ErrorMessage = "invalid email")]
        [Required]
        [JsonProperty(PropertyName = "email")]
        public string EmailAddress { get; set; }

        [RegularExpression(PasswordRegex, ErrorMessage = "minimum 6 character and at least 1 uppercase letter")]
        [Required]
        public string Password { get; set; }

   
        public string ConfirmPassword { get; set; }
     
        public DateTime Expiration { get; set; }

        public string Id { get; set; }

        public bool IsAuthenticated { get; set; }

        public string Name { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        [RegularExpression("^([a-zA-Z0-9-]+)$", ErrorMessage ="invalid name can contain only letters, numbers, and dashes")]
        public string SiteName { get; set; }

        [JsonProperty(PropertyName = "activity")]
        public UserSystemData SystemData { get; set; }

        public string AccessLevel { get; set; }

        public string Invitation { get; set; }
        public int? SiteId { get; set; }
        public int? TenantId { get; set; }
        public string ConfirmationCode { get; set; }
    }

    
    public class User
    {
        public int[] BehaviorIds { get; set; }

        [JsonProperty(PropertyName = "email")]
        public string EmailAddress { get; set; }

        public string Password { get; set; }
        
        public DateTime Expiration { get; set; }
        
        public string Id { get; set; }
        
        public bool IsAuthenticated { get; set; }
        
        public string Name { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }
        
        public string SiteName { get; set; }

        [JsonProperty(PropertyName = "activity")]
        public UserSystemData SystemData { get; set; }

        public string AccessLevel { get; set; }

        public bool IsFulfillerUser { get; set; }
    }
}
