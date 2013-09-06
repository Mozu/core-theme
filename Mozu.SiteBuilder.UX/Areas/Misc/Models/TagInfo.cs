using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Areas.Misc.Models
{
    public class DjangoItemInfo
    {
        public string TagName
        {
            get;
            set;
        }
        public String DocUrl { get; set; }
        public List<string> Examples
        {
            get;
            set;
        }


        public string Description { get; set; }
    }
}