
using Volusion.PlatformService.Contracts;

namespace Volusion.SiteBuilder.ClientRepositories.Admin
{
	public class WebSiteRepository : BaseRepository<WebSite>, IWebSiteRepository
	{
		private readonly IRestRepositoryConfiguration _config;

		public WebSiteRepository(IRestRepositoryConfiguration config)
			: base(config)
		{
			_config = config;
			GetId = ws => ws.Id ;
            RelativeUrl = "/Volusion.PlatformService.WebAPI/websites";
		}

		#region IWebSiteRepository Members

        //public SS.ContentLocaleSet AddLocale(int id, SS.ContentLocaleSet loc)
        //{

        //    var repo = new BaseRepository<SS.ContentLocaleSet>(_config)
        //                {
        //                    RelativeUrl = RelativeUrl + "/" + id + "/locales",
        //                    GetId = x => x.ContentLocaleSetCode
        //                };
        //    return repo.Create(loc);
        //}

		#endregion


        public WebSite FindByDomain(string domain)
        {
            var uri = GetRequestUriForId(string.Format("?domainName={0}", domain));
            return Get(uri);
        }
    }
}