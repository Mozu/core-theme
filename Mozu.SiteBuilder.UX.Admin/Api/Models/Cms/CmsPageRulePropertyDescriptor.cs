using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.Cms
{
    public class CmsPageRulePropertyDescriptor
    {
        public string PropertyName { get; set; }

        public string DataType { get; set; }

        public string[] ValidOperators { get; set; }

        public bool AllowNull { get; set; }

        public bool IsDynamic { get; set; }
    }
}