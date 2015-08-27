using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.Api.Models.FileManagement
{
    public class FileManagementFile
    {
        public string  id { get; set; }
        public string name { get; set; }

        public string[] tags { get; set; }
       // public string thumbnail { get; set; }
        public DateTime? dateModified { get; set; }
        public string fileType { get; set; }
        public long? fileSize { get; set; }
        public bool? isUploaded { get; set; }
        //public string folderId { get; set; }
        public double height { get; set; }
        public double width { get; set; }
    }
}