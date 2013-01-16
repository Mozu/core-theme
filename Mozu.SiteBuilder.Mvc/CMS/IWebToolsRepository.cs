using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.SiteBuilder.UX.Models.Settings;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public interface IWebToolsRepository
    {
        Task<StreamContent> SaveWebmasterToolsFile(string localFileName, string fileName);

        Task<Stream> GetWebMasterToolsFile(string fileName);

        Task<StreamContent> SaveRobotsContent(RobotsTxtSettings settings);

        Task<string> GetRobotsContent();
    }
}