using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Magnum.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;

namespace Mozu.SiteBuilder.UX.Models.Admin.CMS
{


    public class DocumentRequest
    {
        public string Id { get; set; }
        public string ListFQN { get; set; }
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
        public string DocumentTypeFQN { get; set; }
        [System.Runtime.Serialization.IgnoreDataMember()]
        public Mozu.Content.Contracts.Document Document { get; set; }




        //public object this[string key]
        //{
        //    get
        //    {
        //        if (this.Document == null)
        //        {
        //            return null;
        //        }
        //        if (string.Equals(key, "name", StringComparison.OrdinalIgnoreCase))
        //        {
        //            return Document.Name;
        //        }

        //        return Document.Properties.Where(x => string.Equals(x.PropertyType, key, StringComparison.OrdinalIgnoreCase)).Select(x => x.Value).FirstOrDefault();
        //    }
        //}


        public string PublishState { get; set; }
    }
}
