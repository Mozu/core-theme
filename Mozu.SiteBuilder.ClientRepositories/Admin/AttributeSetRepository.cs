using Volusion.Attribute.Contracts.Administration;

namespace Volusion.SiteBuilder.ClientRepositories.Admin
{
    public class AttributeSetRepository : BaseRepository<AttributeSet>, IAttributeSetRepository
    {
        public AttributeSetRepository(IRestRepositoryConfiguration restConfig) : base(restConfig)
        {
            RelativeUrl = "/Volusion.Attribute.WebApi/AttributeSets";
            GetId = (d) => d.Id;
        }

        public AttributeSetCollection GetAttributeSets()
        {
            var requestUri = RelativeUrl;
            using (var client = GetServiceClient())
            {
                using (var resp = client.GetAsync(requestUri).Result)
                {
                    Validate(resp);
                    return ToObjectContent<AttributeSetCollection>(resp.Content).ReadAsAsync().Result;
                }
            }
        }
    }
}
