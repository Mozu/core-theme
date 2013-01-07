using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Volusion.Attribute.Contracts.Administration;

namespace Volusion.SiteBuilder.ClientRepositories.Admin.MockRepositories
{
    public class MockAttributeSetRepository : IAttributeSetRepository
    {
        public AttributeSet Get(object id)
        {
            throw new NotImplementedException();
        }

        public AttributeSet Update(AttributeSet entity)
        {
            throw new NotImplementedException();
        }

        public AttributeSet Create(AttributeSet entity)
        {
            throw new NotImplementedException();
        }

        public void Delete(object id)
        {
            throw new NotImplementedException();
        }

        public AttributeSetCollection GetAttributeSets()
        {
            throw new NotImplementedException();
        }
    }
}
