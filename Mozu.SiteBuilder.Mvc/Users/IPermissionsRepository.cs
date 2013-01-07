using System.Collections.Generic;
using Mozu.SiteBuilder.UX.Models.Users;

namespace Mozu.SiteBuilder.Mvc.Users
{
    public interface IPermissionsRepository
    {
        List<Role> GetRoles();

        Role GetRole(int? id);

        Role AddRole(Role role);

        void DeleteRole(Role role);

        Role UpdateRole(Role role);

        List<Behavior> GetBehaviors();

        Behavior GetBehavior(int? id);

        List<BehaviorCategory> GetCategories();

        BehaviorCategory GetCategory(int? id);

        BehaviorTree GetBehaviorTree();
    }
}