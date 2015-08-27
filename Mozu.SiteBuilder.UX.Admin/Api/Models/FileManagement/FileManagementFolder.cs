using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.FileManagement
{
    public class FileManagementFolder
    {
        public string  id { get; set; }
        public string name { get; set; }
        public bool leaf { get; set; }
        public string parentId { get; set; }
        public List<FileManagementFolder> items { get; set; }

        public bool expanded { get; set; }
    }
}