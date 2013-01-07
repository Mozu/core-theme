using System.Threading.Tasks;
using Volusion.SiteBuilder.ClientRepositories.Authentication;

namespace Volusion.SiteBuilder.ClientRepositories.Admin.MockRepositories
{
	using System;
	using Volusion.Core;
	using Volusion.UserService.Contracts;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
	public class MockUserAuthTicketRepository : IUserAuthTicketServiceClient
    {
		#region Implementation of IUserAuthTicketServiceClient

    	public Task Delete(string refreshToken)
		{
			return  new Task(()=> { });	//What should this do here???
		}

		public Task<UserAuthTicket> ConvertForSite(UserTokenInfo userTokenInfo)
		{
			return
				new Task<UserAuthTicket>(() =>
				{
					var claim = new LightweightUserClaims()
					{
						EmailAddress = "food@bing.com",
						Expiration = DateTime.MaxValue,
						Id = Guid.NewGuid().ToString(),
						SiteId = "1",
						Version = 1,
						BehaviorIds = new short[] { 1, 2, 3 }
					};

					var ticket = new UserAuthTicket()
					{
						AccessToken = claim.ToAccessToken(),
						AccessTokenExpiration = DateTime.MaxValue,
						RefreshToken = claim.ToAccessToken(),
						RefreshTokenExpiration = DateTime.MaxValue

					};
					return ticket;
				});
		}

		public Task<UserAuthTicket> Create(UserAuthInfo userInfo, string refreshToken = null)
    	{
    		return 
				 Task<UserAuthTicket>.Factory.StartNew(()=>
    					{
							var claim = new LightweightUserClaims()
							{
								EmailAddress = userInfo.EmailAddress,
								Expiration = DateTime.MaxValue,
								Id = userInfo.EmailAddress,
								
								Version = 1,
								BehaviorIds = new short[] { 1, 2, 3 }
							};

							var ticket = new UserAuthTicket()
							{
								AccessToken = claim.ToAccessToken(),
								AccessTokenExpiration = DateTime.MaxValue,
								RefreshToken = claim.ToAccessToken(),
								RefreshTokenExpiration = DateTime.MaxValue

							};
							return ticket;
    					});
    	}

    	#endregion
    }
}
