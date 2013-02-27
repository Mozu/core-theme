//using Mozu.Core.Configuration;
//using AutoMapper;
//using System.Linq;
//using Volusion.SiteBuilder.UX.Models;

//namespace Mozu.SiteBuilder.UX.StartupTasks
//{
//    public class MappingConfigurationStartupTask :StartUpTask
//    {
//        #region Overrides of StartUpTask

//        public override void Execute()
//        {
//            var profileType = typeof  ( Profile );

          
//             Mapper.Initialize(mapper =>
//                          {
//                              this.GetType().Assembly.GetTypes()
//                                  .Where(x => x.IsSubclassOf(profileType))
//                                  .Select(y => (Profile)System.Activator.CreateInstance(y)).ToList()
//                                  .ForEach
//                                  (
//                                    prof =>
//                                    mapper.AddProfile(prof)
//                                  );
                          
//                          });


      
//        }

//        #endregion
//    }

             

//}