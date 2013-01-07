using System;
using Volusion.Attribute.Contracts.Administration;

namespace Volusion.SiteBuilder.ClientRepositories.Admin.MockRepositories
{
    public class MockAttributeGroupRepository : IAttributeGroupRepository
    {
        public AttributeGroupCollection GetAttributeGroups()
        {
            throw new NotImplementedException();
        }

        public AttributeGroup Get(object id)
        {
            throw new NotImplementedException();
        }

        public AttributeGroup Update(AttributeGroup entity)
        {
            throw new NotImplementedException();
        }

        public AttributeGroup Create(AttributeGroup entity)
        {
            throw new NotImplementedException();
        }

        public void Delete(object id)
        {
            throw new NotImplementedException();
        }
    }
}
