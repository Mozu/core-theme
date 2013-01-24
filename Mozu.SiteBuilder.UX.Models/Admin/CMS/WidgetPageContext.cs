using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;

namespace Mozu.SiteBuilder.UX.Models.Admin.CMS
{
    [DataContract(Name = "wpc")]
    public class WidgetPageContext
    {

        [DataMember(Name = "pid")]
        public string PageId { get; set; }

        [DataMember(Name = "tid")]
        public string TemplateId { get; set; }

        [DataMember(Name = "sid")]
        public string SiteTemplateId { get; set; }

        [DataMember(Name = "p")]
        public string PageName { get; set; }

        [DataMember(Name = "t")]
        public string TemplateName { get; set; }

        [DataMember(Name = "s")]
        public string SiteTemplateName { get; set; }


        [IgnoreDataMember()]
        public List<WidgetRuntimeData> RuntimeData { get; set; }





        [IgnoreDataMember()]
        public bool Initialized { get; set; }

        [IgnoreDataMember()]
        public Mozu.Content.Contracts.Document Page { get; set; }

        [IgnoreDataMember()]
        public Mozu.Content.Contracts.Document Template { get; set; }

        [IgnoreDataMember()]
        public Mozu.Content.Contracts.Document SiteTemplate { get; set; }
    }
}
