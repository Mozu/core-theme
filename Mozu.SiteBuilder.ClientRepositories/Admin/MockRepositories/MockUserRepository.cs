using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volusion.SiteBuilder.ClientRepositories.Admin.ServiceClients;
using Volusion.UserService.Contracts;

namespace Volusion.SiteBuilder.ClientRepositories.Admin.MockRepositories
{
	public class MockUserRepository : MockRepositoryBase<User>, IUserServiceClient
	{
		private readonly IDictionary<string, List<RoleInSite>> _roleInSitesRepo =
			new Dictionary<string, List<RoleInSite>>
				{
					{ "1", new List<RoleInSite> { new RoleInSite { RoleId = 1, SiteId = "1" } } }
				};
		
		public MockUserRepository()
		{
			Repo.Add(
			new User
				{
					EmailAddress = "bob@bob.com",
					FirstName = "Flooby",
					LastName = "Blobfish",
					Id = "123",
					LocaleCode = "en-US",
					Password = "password",
					
					SystemData = new UserSystemData
					             	{
					             		CreatedOn = DateTime.UtcNow,
					             		FailedLoginAttemptCount = 0,
					             		IsLocked = false,
					             		UpdatedOn = DateTime.UtcNow
					             	}
				});

			GetEntityId = m => m.Id;
			SetEntityId = m => m.Id = new Guid().ToString();
		}

		public override void Patch(User updatedEntity, User existingEntity)
		{
			existingEntity.FirstName = updatedEntity.FirstName;
			existingEntity.LastName = updatedEntity.LastName;
			existingEntity.EmailAddress = updatedEntity.LastName;
			existingEntity.LocaleCode = updatedEntity.LocaleCode;
			existingEntity.Password = updatedEntity.Password;
			updatedEntity.SystemData = updatedEntity.SystemData ?? new UserSystemData();
			updatedEntity.SystemData.UpdatedOn = DateTime.UtcNow;
		}

		#region Implementation of IUserServiceClient

		public Task<User> GetUserByEmail(string emailAddress)
		{
			return Task<User>.Factory.StartNew(() => Repo.FirstOrDefault(x => x.EmailAddress == emailAddress));
		}

		public Task ChangePassword(string userId, string password, string newPassword)
		{
			return Task.Factory.StartNew(()=>
			                	{
			                		var user = Get(userId);
										user.Password = newPassword;
			                	});
		}

		public Task ResetPassword(string emailAddress, string siteId)
		{
			return Task.Factory.StartNew(()=> { });
		}

		public Task UpdateForgottenPassword(string userId, string confirmationCode, string newPassword)
		{
			return Task.Factory.StartNew(()=> { });
		}

		public Task<RoleInSiteCollection> GetUserRoles(string userId)
		{
			return Task<RoleInSiteCollection>.Factory.StartNew(()=>
			                                      	{
																	var roleinsite = _roleInSitesRepo[userId];
																	return new RoleInSiteCollection { Items = roleinsite };
			                                      	});
		}

		//TODO: FIX this method...
		public Task<RoleInSiteCollection> AddUserRoleForSite(string userId, int roleId)
		{
			return Task<RoleInSiteCollection>.Factory.StartNew(() =>
			                                      	{
																	List<RoleInSite> roles;
																	if (!_roleInSitesRepo.TryGetValue(userId, out roles))
																	{
																		roles = new List<RoleInSite>();
																		_roleInSitesRepo.Add(userId, roles);
																	}


																	if (roles != null)
																		roles.Add( new RoleInSite{ RoleId = roleId, SiteId = "1" });

																	return new RoleInSiteCollection { Items = roles };
			                                      	});
		}


		public Task DeleteUserRoleForSite(string userId, int roleId)
		{
			return Task.Factory.StartNew(()=>
			                	{
										var role = _roleInSitesRepo[userId].FirstOrDefault(r=>r.RoleId == roleId);
										if (role != null)
											_roleInSitesRepo[userId].Remove(role);
			                	});
		}

		#endregion
	}
}
