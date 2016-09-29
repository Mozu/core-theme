using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.SiteBuilder
{
    public class SearchItem
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Url { get; set; }
        public bool IsCategory { get; set; }
        public bool isDocument { get; set; }
    }

}