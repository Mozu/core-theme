using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Mozu.SiteBuilder.UX.Models.Users;

namespace Mozu.SiteBuilder.Mvc.Users
{
    public interface IPermissionsRepository
    {
        Task<Core.Api.Contracts.RoleCollection> GetRoles(int? startIndex, int? pageSize);

        Task<Role> GetRole(int? id);

        Task<Role> AddRole(Role role);

        Task<ActionResult> DeleteRole(Role role);

        Task<Role> UpdateRole(Role role);

        Task<RoleBehavior> GetRoleBehavior(int? id);

        Task<RoleBehavior> UpdateRoleBehavior(RoleBehavior roleBehavior);

        Task<List<Behavior>> GetBehaviors();

        Task<Behavior> GetBehavior(int? id);

        Task<List<BehaviorCategory>> GetCategories();

        Task<BehaviorCategory> GetCategory(int? id);

        Task<BehaviorTree> GetBehaviorTree();
    }
}