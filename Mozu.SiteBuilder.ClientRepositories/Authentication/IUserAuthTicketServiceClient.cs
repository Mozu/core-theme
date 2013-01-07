using System.Threading.Tasks;
using Volusion.SiteBuilder.ClientRepositories.ServiceClient;
using Volusion.UserService.Contracts;

namespace Volusion.SiteBuilder.ClientRepositories.Authentication
{
	public interface IUserAuthTicketServiceClient : IServiceClient<UserAuthTicket>
	{
		Task<UserAuthTicket> Create(UserAuthInfo userAuthInfo, string refreshToken = null);
		Task Delete(string refreshToken);
        Task<UserAuthTicket> ConvertForSite(UserTokenInfo userTokenInfo);
        
	}
}