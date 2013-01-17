using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Settings;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public interface IWebToolsRepository
    {
        Task<bool> SaveWebmasterToolsFile(string localFileName, string fileName);

        Task<Stream> GetWebMasterToolsFile(string fileName);

        Task<bool> SaveRobotsContent(RobotsTxtSettings settings);

        Task<string> GetRobotsContent();
    }
}