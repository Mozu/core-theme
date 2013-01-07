using System.Collections.Generic;
using Volusion.PlatformService.Contracts;
//using SS = Volusion.SiteService.DataContracts.Administration;
namespace Volusion.SiteBuilder.ClientRepositories.Admin
{
	public interface IWebSiteRepository : IRepository<WebSite>
	{
        //SS.ContentLocaleSet AddLocale(int id, SS.ContentLocaleSet loc);
        WebSite FindByDomain(string domain);
        
		IEnumerable<WebSite> List();
	}
}