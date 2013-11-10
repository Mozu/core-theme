using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Models.Admin.CMS
{
    public class DocumentRequest
    {
        public string Id { get; set; }
        public string Collection { get; set; }
        public string Path { get; set; }
        public string DocumentType { get; set; }
        [System.Runtime.Serialization.IgnoreDataMember()]
        public Mozu.Content.Contracts.Document Document { get; set; }

    }
}
