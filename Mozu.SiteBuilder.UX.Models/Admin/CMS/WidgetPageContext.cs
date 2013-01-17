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
        
        [DataMember(Name="p")]
        public string PageId { get; set; }
        [DataMember(Name = "t")]
        public string TemplateId { get; set; }
        [DataMember(Name = "s")]
        public string SiteTemplateId { get; set; }

        [IgnoreDataMember()]
        public List<WidgetRuntimeData> RuntimeData { get; set; }


        
    }
}
