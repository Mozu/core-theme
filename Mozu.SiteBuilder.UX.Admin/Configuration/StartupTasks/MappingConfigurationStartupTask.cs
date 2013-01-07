using Mozu.Core.Configuration;
using AutoMapper;
using System.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Configuration.StartupTasks
{
    public abstract class StartUpTask
    {
        public abstract void Execute();
    }

	public class MappingConfigurationStartupTask : StartUpTask
	{
		#region Overrides of StartUpTask

		public override void Execute()
		{
            var profileType = typeof  ( Profile );
            
            Mapper.Initialize(mapper =>
            {
                this.GetType().Assembly.GetTypes()
                    .Where(x => x.IsSubclassOf(profileType))
                    .Select(y => (Profile)System.Activator.CreateInstance(y)).ToList()
                    .ForEach(prof => mapper.AddProfile(prof));
            });
		}

		#endregion
	}
}