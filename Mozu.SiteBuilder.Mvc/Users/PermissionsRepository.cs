using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.Reference.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.Users;

namespace Mozu.SiteBuilder.Mvc.Users
{
    public class PermissionsRepository : IPermissionsRepository
    {
        private readonly IMultiScopeRoleWebApiClient _rolesWebApiClient;
        private readonly IReferenceDataWebApiClient _referenceWebApiClient;
        private readonly IApiContext _apiContext;
        private readonly ISettings _settings;
   


        public PermissionsRepository(IMultiScopeRoleWebApiClient rolesWebApiClient, IReferenceDataWebApiClient referenceWebApiClient, IApiContext apiContext, ISettings settings )
        {
            _rolesWebApiClient = rolesWebApiClient;
            _referenceWebApiClient = referenceWebApiClient;
            _apiContext = apiContext;
            _settings = settings;
        }

        public Task<List<Role>> GetRoles()
        {
            var response = _rolesWebApiClient.GetRoles(UserScopeType.Tenant.ToString( ), _apiContext.TenantId).Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return InTask(new List<Role>(0));

            var roles = response.ReadAsAsync().Result;

            return InTask(Mapper.Map<List<Role>>(roles.Items));
        }

        public Task<Role> GetRole(int? id)
        {
            var response = _rolesWebApiClient.GetRole(id, UserScopeType.Tenant.ToString(), _apiContext.TenantId).Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return null;

            var role = response.ReadAsAsync().Result;

            return InTask(Mapper.Map<Role>(role));
        }

        public Task<Role> AddRole(Role role)
        {
            var mapped = Mapper.Map<Core.Api.Contracts.Role>(role);
            var response = _rolesWebApiClient.CreateRole(mapped, UserScopeType.Tenant.ToString(), _apiContext.TenantId).Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return null;

            var newRole = response.ReadAsAsync().Result;

            return InTask(Mapper.Map<Role>(newRole));
        }

        public Task<StreamContent> DeleteRole(Role role)
        {
            return _rolesWebApiClient.DeleteRole(role.Id, UserScopeType.Tenant.ToString(), _apiContext.TenantId).Result.ReadAsAsync();
        }

        public Task<Role> UpdateRole(Role role)
        {
            var mapped = Mapper.Map<Core.Api.Contracts.Role>(role);
            var response = _rolesWebApiClient.UpdateRole(mapped, role.Id, UserScopeType.Tenant.ToString(), _apiContext.TenantId).Result;

            if (response.HasException)
            {
                throw response.ReadException();
            }

            if (!response.ResponseMessage.IsSuccessStatusCode)
            {
                return null;
            }

            var updatedRole = response.ReadAsAsync().Result;

            return InTask(Mapper.Map<Role>(updatedRole));
        }

        public Task<RoleBehavior> GetRoleBehavior(int? id)
        {
            var role = GetRole(id).Result;

            return InTask(new RoleBehavior
            {
                Id = role.Id,
                Children = role.Behaviors.Select(x => x.Id).ToList(),
            });
        }

        public Task<RoleBehavior> UpdateRoleBehavior(RoleBehavior roleBehavior)
        {
            var roleTask = GetRole(roleBehavior.Id);
            var behaviorsTask = GetBehaviors();

            if (roleTask == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var behaviors = behaviorsTask.Result.Where(b => roleBehavior.Children.Contains(b.Id));
            var role = roleTask.Result;

            role.Behaviors.Clear();
            role.Behaviors.AddRange(behaviors);

            return InTask(roleBehavior);
        }

        public Task<List<Behavior>> GetBehaviors()
        {
            var response = _referenceWebApiClient.GetBehaviors(UserScopeType.Tenant.ToString()).Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return InTask(new List<Behavior>(0));

            var behaviors = response.ReadAsAsync().Result;

            return InTask(Mapper.Map<List<Behavior>>(behaviors.Items));
        }

        public Task<Behavior> GetBehavior(int? id)
        {
            var response = _referenceWebApiClient.GetBehavior(id).Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return null;

            var behavior = response.ReadAsAsync().Result;

            return InTask(Mapper.Map<Behavior>(behavior));
        }

        public Task<List<BehaviorCategory>> GetCategories()
        {
            var response = _referenceWebApiClient.GetBehaviorCategories().Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return InTask(new List<BehaviorCategory>(0));

            var behaviorCategories = response.ReadAsAsync().Result;

            return InTask(Mapper.Map<List<BehaviorCategory>>(behaviorCategories.Items));
        }

        public Task<BehaviorCategory> GetCategory(int? id)
        {
            var response = _referenceWebApiClient.GetBehaviorCategory(id).Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return null;

            var behaviorCategory = response.ReadAsAsync().Result;

            return InTask(Mapper.Map<BehaviorCategory>(behaviorCategory));
        }

        public Task<BehaviorTree> GetBehaviorTree()
        {
            var categories = GetCategories();
            var behaviors = GetBehaviors();
         
        



            //var filterStr = _settings.AppSettings("role_categories");
            //if (!string.IsNullOrWhiteSpace(filterStr))
            //{
            //    validCats = filterStr.Split(',').Select(x => int.Parse(x)).ToArray();
            //}
            return InTask(new BehaviorTree(categories, behaviors ));
        }

        private static Task<T> InTask<T>(T thing)
        {
            return Task.Factory.StartNew(() => thing);
        }
    }
}