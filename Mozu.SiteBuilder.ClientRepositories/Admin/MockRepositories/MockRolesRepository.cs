// -----------------------------------------------------------------------
// <copyright file="MockRolesRepository.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Volusion.SiteBuilder.ClientRepositories.Admin.MockRepositories
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using Volusion.SiteBuilder.ClientRepositories.Authentication;
    using Volusion.UserService.Contracts;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class MockRolesRepository : IRolesRepository
    {

        public Role Get(object id)
        {
            throw new NotImplementedException();
        }

        public Role Update(Role entity)
        {
            throw new NotImplementedException();
        }

        public Role Create(Role entity)
        {
            throw new NotImplementedException();
        }

        public void Delete(object id)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<Role> List()
        {
            return new List<Role>()
            {
                new Role()
                {
                    Behaviors = new List<int>(){ 1,2,3},
                    Id=1,
                    Name= "SuperAdmin"
                },
                new Role()
                {
                    Behaviors = new List<int>(){ 2,3},
                    Id=2,
                    Name= "Admin"
                },
                new Role()
                {
                    Behaviors = new List<int>(){ 3},
                    Id=3,
                    Name= "Shopper"
                },

            };
        }
    }
}
