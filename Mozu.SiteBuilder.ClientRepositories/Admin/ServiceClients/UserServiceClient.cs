using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Server.Common;
using Volusion.Core.Logging;
using Volusion.SiteBuilder.ClientRepositories.ServiceClient;
using Volusion.SiteBuilder.Mvc;
using Volusion.UserService.Contracts;

namespace Volusion.SiteBuilder.ClientRepositories.Admin.ServiceClients
{
	public interface IUserServiceClient : IRepositoryServiceClient<User>, IRepositoryServiceClientAsync<User>
	{
		Task<User> GetUserByEmail(string emailAddress);
		Task ChangePassword(string userId , string password, string newPassword);
		Task ResetPassword(string emailAddress, string siteId);
		Task UpdateForgottenPassword(string userId, string confirmationCode, string newPassword);

		Task<RoleInSiteCollection> GetUserRoles(string userId);
		Task<RoleInSiteCollection> AddUserRoleForSite(string userId, int roleId);
		Task DeleteUserRoleForSite( string userId, int roleId);
	}

	public class UserServiceClient : ServiceClientBase<User>, IUserServiceClient
	{
		public UserServiceClient(ISiteBuilderContext siteBuilderContext, IResourceUriResolver resourceUriResolver, ILogger logger)
			: base(siteBuilderContext, resourceUriResolver)
		{
			GetEntityId = m => m.Id;
			Logger = logger;
		}

		#region Implementation of IUserServiceClient

		public Task<User> GetUserByEmail(string emailAddress)
		{
			var requestUri = String.Format("{0}?emailaddress={1}", HttpClient.BaseAddress, UrlUtility.UrlEncode(emailAddress));
			Logger.Debug(String.Format("Sending GET request for resource: {0}", requestUri));
			return
				HttpClient.GetAsync(requestUri).ContinueWith(responseTask => GetResult<User>(responseTask));
		}

		public Task ChangePassword(string userId, string password, string newPassword)
		{
			var entity = new PasswordInfo
			              	{
			              		NewPassword = newPassword,
			              		OldPassword = password
			              	};
			var requestUri = String.Format("{0}/{1}/changepassword", HttpClient.BaseAddress, userId);
			var objContent = new ObjectContent<PasswordInfo>(entity, MediaTypeFormatters[0].SupportedMediaTypes[0].MediaType,
														  MediaTypeFormatters);

			Logger.Debug(String.Format("Posting PasswordInfo to: {0}:{1}", requestUri,
												objContent.ReadAsStringAsync().Result));

			return HttpClient.PostAsync(requestUri, objContent).ContinueWith(ValidateVoidAsyncResponse); 
		}

		public Task ResetPassword(string emailAddress, string siteId )
		{
			var entity = new ResetPasswordInfo
			{
				EmailAddress = emailAddress,
				SiteId = siteId
			};
			var requestUri = String.Format("{0}/resetpassword", HttpClient.BaseAddress);
			var objContent = new ObjectContent<ResetPasswordInfo>(entity, MediaTypeFormatters[0].SupportedMediaTypes[0].MediaType,
														  MediaTypeFormatters);

			Logger.Debug(String.Format("Posting ResetPasswordInfo to: {0}:{1}", requestUri,
												objContent.ReadAsStringAsync().Result));

			return HttpClient.PostAsync(requestUri, objContent).ContinueWith(ValidateVoidAsyncResponse); 
		}

		public Task UpdateForgottenPassword(string userId, string confirmationCode, string newPassword)
		{
			var entity = new ConfirmationInfo
			{
				ConfirmationCode = confirmationCode,
				NewPassword = newPassword
			};
			var requestUri = String.Format("{0}/{1}/updateforgottenpassword", HttpClient.BaseAddress, userId);
			var objContent = new ObjectContent<ConfirmationInfo>(entity, MediaTypeFormatters[0].SupportedMediaTypes[0].MediaType,
														  MediaTypeFormatters);

			Logger.Debug(String.Format("Posting ConfirmationInfo to: {0}:{1}", requestUri,
												objContent.ReadAsStringAsync().Result));

			return HttpClient.PostAsync(requestUri, objContent).ContinueWith(ValidateVoidAsyncResponse); 
		}

		public Task<RoleInSiteCollection> GetUserRoles(string userId)
		{
			var requestUri = String.Format("{0}/roles", HttpClient.BaseAddress);
			Logger.Debug(String.Format("Sending GET request for resource: {0}", requestUri));
			return
				HttpClient.GetAsync(requestUri).ContinueWith(responseTask => GetResult<RoleInSiteCollection>(responseTask));
		}

		public Task<RoleInSiteCollection> AddUserRoleForSite(string userId, int roleId)
		{
			var requestUri = String.Format("{0}/{1}/roles?roleId={2}", HttpClient.BaseAddress, userId, roleId);
			var content = new ObjectContent<int>(roleId, MediaTypeFormatters[0].SupportedMediaTypes[0].MediaType,
														  MediaTypeFormatters);

			Logger.Debug(String.Format("Putting update for resource: {0}:{1}", requestUri, content.ReadAsStringAsync().Result));
			return HttpClient.PutAsync(requestUri, content).ContinueWith(responseTask => GetResult<RoleInSiteCollection>(responseTask));
		}

		public Task DeleteUserRoleForSite(string userId, int roleId)
		{
			var requestUri = String.Format("{0}/{1}/roles?roleId={2}", HttpClient.BaseAddress, userId, roleId);
			Logger.Debug(String.Format("Sending DELETE request for resource: {0}", requestUri));
			return
				HttpClient.DeleteAsync(requestUri).ContinueWith(ValidateVoidAsyncResponse);
		}

		#endregion
	}
}
