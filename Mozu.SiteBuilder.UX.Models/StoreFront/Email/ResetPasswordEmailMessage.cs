using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mozu.SiteBuilder.UX.Models.StoreFront.Email
{
    public class ResetPasswordEmailMessage
    {
        public string ValidationToken { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string SendTo { get; set; }
        public string UserName { get; set; }
        public string ResetPasswordLink { get; set; }
    }
}
