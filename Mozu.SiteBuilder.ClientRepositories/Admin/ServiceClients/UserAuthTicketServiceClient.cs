using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Volusion.Core.Logging;
using Volusion.SiteBuilder.ClientRepositories.Authentication;
using Volusion.SiteBuilder.ClientRepositories.ServiceClient;
using Volusion.SiteBuilder.Mvc;
using Volusion.UserService.Contracts;

namespace Volusion.SiteBuilder.ClientRepositories.Admin.ServiceClients
{
	public class UserAuthTicketServiceClient : ServiceClientBase<UserAuthTicket>, IUserAuthTicketServiceClient
	{
		public UserAuthTicketServiceClient(ISiteBuilderContext siteBuilderContext, IResourceUriResolver resourceUriResolver,
		                                   ILogger logger)
			: base(siteBuilderContext, resourceUriResolver)
		{
			Logger = logger;
		}

		#region Implementation of IUserAuthTicketServiceClient

		public Task<UserAuthTicket> Create(UserAuthInfo userAuthInfo, string refreshToken = null)
		{
			var buf = new StringBuilder(HttpClient.BaseAddress.ToString());
			if (!String.IsNullOrEmpty(refreshToken))
				buf.AppendFormat("?refreshToken={0}", refreshToken);

			string requestUri = buf.ToString();
			var objContent = new ObjectContent<UserAuthInfo>(userAuthInfo,
			                                                 MediaTypeFormatters[0].SupportedMediaTypes[0].MediaType,
			                                                 MediaTypeFormatters);

			Logger.Debug(String.Format("Posting UserAuthInfo to: {0}:{1}", requestUri, objContent.ReadAsStringAsync().Result));

			return
				HttpClient.PostAsync(requestUri, objContent).ContinueWith(responseTask => GetResult<UserAuthTicket>(responseTask));
		}

		public Task Delete(string refreshToken)
		{
			string requestUri = String.Format("{0}/{1}", HttpClient.BaseAddress, refreshToken);
			Logger.Debug(String.Format("Sending DELETE request for resource: {0}", requestUri));
			return
				HttpClient.DeleteAsync(requestUri).ContinueWith(ValidateVoidAsyncResponse);
		}

		public Task<UserAuthTicket> ConvertForSite(UserTokenInfo userTokenInfo)
		{
			string requestUri = String.Format("{0}/convertforsite", HttpClient.BaseAddress);
			var objContent = new ObjectContent<UserTokenInfo>(userTokenInfo,
			                                                  MediaTypeFormatters[0].SupportedMediaTypes[0].MediaType,
			                                                  MediaTypeFormatters);

			Logger.Debug(String.Format("Posting UserTokenInfo to: {0}:{1}", requestUri, objContent.ReadAsStringAsync().Result));

			return
				HttpClient.PostAsync(requestUri, objContent).ContinueWith(responseTask => GetResult<UserAuthTicket>(responseTask));
		}

		#endregion
	}
}