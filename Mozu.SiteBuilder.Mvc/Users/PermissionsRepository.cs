using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using AutoMapper;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.Users;

namespace Mozu.SiteBuilder.Mvc.Users
{
    public class PermissionsRepository : IPermissionsRepository
    {
        private readonly IRoleWebApiClient _rolesWebApiClient;
        private readonly IBehaviorWebApiClient _behaviorWebApiClient;

        public PermissionsRepository(IRoleWebApiClient rolesWebApiClient, IBehaviorWebApiClient behaviorWebApiClient)
        {
            _rolesWebApiClient = rolesWebApiClient;
            _behaviorWebApiClient = behaviorWebApiClient;
        }

        public List<Role> GetRoles()
        {
            var response = _rolesWebApiClient.GetRoles().Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return new List<Role>(0);

            var roles = response.ReadAsAsync().Result;

            return Mapper.Map<List<Role>>(roles.Items);
        }

        public Role GetRole(int? id)
        {
            var response = _rolesWebApiClient.GetRole(id).Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return null;

            var role = response.ReadAsAsync().Result;

            return Mapper.Map<Role>(role);
        }

        public Role AddRole(Role role)
        {
            var mapped = Mapper.Map<Core.Api.Contracts.Role>(role);
            var response = _rolesWebApiClient.CreateRole(mapped).Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return null;

            var newRole = response.ReadAsAsync().Result;

            return Mapper.Map<Role>(newRole);
        }

        public void DeleteRole(Role role)
        {
            _rolesWebApiClient.DeleteRole(role.Id).Result.ReadAsAsync();
        }

        public Role UpdateRole(Role role)
        {
            var mapped = Mapper.Map<Core.Api.Contracts.Role>(role);
            var response = _rolesWebApiClient.UpdateRole(mapped, role.Id).Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return null;

            var updatedRole = response.ReadAsAsync().Result;

            return Mapper.Map<Role>(updatedRole);
        }

        public RoleBehavior GetRoleBehavior(int? id)
        {
            var role = GetRole(id);
            var behaviors = GetBehaviors().Where(b => role.Behaviors.Select(x => (int?)x.Id).Contains(id));

            return new RoleBehavior
            {
                Id = role.Id,
                Children = behaviors.Select(b => b.Id).ToList(),
            };
        }

        public RoleBehavior UpdateRoleBehavior(RoleBehavior roleBehavior)
        {
            var role = GetRole(roleBehavior.Id);
            var behaviors = GetBehaviors().Where(b => roleBehavior.Children.Contains(b.Id));

            if (role == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            role.Behaviors.Clear();
            role.Behaviors.AddRange(behaviors);

            return roleBehavior;
        }

        public List<Behavior> GetBehaviors()
        {
            var response = _behaviorWebApiClient.GetBehaviors().Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return new List<Behavior>(0);

            var behaviors = response.ReadAsAsync().Result;

            return Mapper.Map<List<Behavior>>(behaviors.Items);
        }

        public Behavior GetBehavior(int? id)
        {
            var response = _behaviorWebApiClient.GetBehavior(id).Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return null;

            var behavior = response.ReadAsAsync().Result;

            return Mapper.Map<Behavior>(behavior);
        }

        public List<BehaviorCategory> GetCategories()
        {
            var response = _behaviorWebApiClient.GetCategories().Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return new List<BehaviorCategory>(0);

            var behaviorCategories = response.ReadAsAsync().Result;

            return Mapper.Map<List<BehaviorCategory>>(behaviorCategories.Items);
        }

        public BehaviorCategory GetCategory(int? id)
        {
            var response = _behaviorWebApiClient.GetCategory(id).Result;

            if (response.HasException || !response.ResponseMessage.IsSuccessStatusCode)
                return null;

            var behaviorCategory = response.ReadAsAsync().Result;

            return Mapper.Map<BehaviorCategory>(behaviorCategory);
        }

        public BehaviorTree GetBehaviorTree()
        {
            var categories = GetCategories();
            var behaviors = GetBehaviors();

            return new BehaviorTree(categories, behaviors);
        }
    }
}