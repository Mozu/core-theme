

using Volusion.PlatformService.Contracts;
namespace Volusion.SiteBuilder.ClientRepositories.Admin

{
	/// <summary>
	/// TODO: Update summary.
	/// </summary>
	public class TenantRepository : BaseRepository<Tenant>
	{
		public TenantRepository(IRestRepositoryConfiguration config)
			: base(config)
		{
			GetId = x => x.Id ;
			RelativeUrl = "/Volusion.PlatformService.WebAPI/tenants";
		}
	}
}