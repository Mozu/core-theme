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
        private string _path;
        public string Path {
            get
            {
                return _path;
            }
            set
            {
                _path = value;
                if (_path != null)
                {
                    _path = _path.Replace("/", "-").Replace("\\", "-");
                }
                
            }}
        public string DocumentType { get; set; }
        [System.Runtime.Serialization.IgnoreDataMember()]
        public Mozu.Content.Contracts.Document Document { get; set; }


        public string PublishState { get; set; }
    }
}
