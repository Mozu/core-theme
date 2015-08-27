using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Testing
{
    public class Site
    {
        public int? id
        {
            get;
            set;
        }
        public string name
        {
            get;
            set;
        }
        public int? tenantId
        {
            get;
            set;
        }
    }
}