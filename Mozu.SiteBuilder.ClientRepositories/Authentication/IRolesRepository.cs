// -----------------------------------------------------------------------
// <copyright file="IRolesRepository.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

namespace Volusion.SiteBuilder.ClientRepositories.Authentication
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using Volusion.UserService.Contracts;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public interface  IRolesRepository : IRepository<Role>
    {
        IEnumerable<Role> List();
    }
   
}
