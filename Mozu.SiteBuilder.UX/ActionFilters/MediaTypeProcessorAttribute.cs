using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;


namespace Mozu.SiteBuilder.UX.ActionFilters
{
    public class JsonPostResult
    {
        public JsonPostResult()
        {
            ErrorCount = 0;
        }
        public string ErrorMessage
        {
            get;
            set;
        }
        public int ErrorCount
        {
            get;
            set;
        }
        public object Data
        {
            get;
            set;
        }
    }
  
}



