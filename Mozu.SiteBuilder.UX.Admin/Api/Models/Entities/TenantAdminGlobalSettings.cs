using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Entities
{
    public class TenantAdminGlobalSettings
    {
        public string Name
        {
            get { return "Global"; }
        }

        public bool? EntityManagerVisible { get; set; }
        public bool? SiteBuilderContentListsVisible { get; set; }
        public bool? CustomRoutesVisible { get; set; }
    }
}