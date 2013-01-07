using System.Collections.Generic;

namespace Volusion.SiteBuilder.ClientRepositories.Admin
{
    public interface IAttributeRepository : IRepository<Attribute.Contracts.Administration.Attribute>
    {
        Attribute.Contracts.Administration.AttributeCollection GetAttributes();
    }
}
