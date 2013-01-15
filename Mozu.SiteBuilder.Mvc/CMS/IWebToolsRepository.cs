using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public interface IWebToolsRepository
    {
        Task<StreamContent> SaveWebmasterToolsFile(string localFileName, string fileName);

        Stream GetWebMasterToolsFile(string fileName);
    }
}