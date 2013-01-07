using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Volusion.SiteBuilder.ClientRepositories.Admin
{
  

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class RestRepositoryConfiguration : IRestRepositoryConfiguration
    {
        public RestRepositoryConfiguration()
        {
            TennantId = "1";
            Url = "http://deviis03.adsdev.volusion.com:8080/";
           // Url = "http://txwks3164.ads.volusion.com:8099/";
        }

        public string TennantId
        {
            get;
            set;
        }
        public string SiteId
        {
            get;
            set;
        }
        public string Url
        {
            get;
            set;
        }

    }
}
