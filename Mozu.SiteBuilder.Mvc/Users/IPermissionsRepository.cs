using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Users;

namespace Mozu.SiteBuilder.Mvc.Users
{
    public interface IPermissionsRepository
    {
        Task<List<Role>> GetRoles();

        Task<Role> GetRole(int? id);

        Task<Role> AddRole(Role role);

        Task<StreamContent> DeleteRole(Role role);

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