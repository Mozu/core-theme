using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using Mozu.Core.Settings;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.Themes
{
    public interface  INfsConnectionWarmer
    {
        void Start();
        void Stop();
    }
    class StorageGatewayConnectionWarmer : INfsConnectionWarmer
    {
        ISettings _settings;
        Timer _timer;
        System.IO.FileStream _fileStream;
        ILogger _logger;
        int _secondsInterval; 
        public StorageGatewayConnectionWarmer(ISettings settings)
        {
            _logger = LoggingService.LoggerFor<StorageGatewayConnectionWarmer>();
            _settings = settings;
           // _logger = logger;
            _secondsInterval = settings.AppSettingsAsNullableInt("sitebuilder.nfswarmup.interval").GetValueOrDefault(60 );
            _timer = new Timer(Callback, this, Timeout.InfiniteTimeSpan, Timeout.InfiniteTimeSpan);
        }


        void Callback(object state)
        {
            try
            {
                OpenConnection();
            }
            catch (ThreadAbortException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.Error("error in nfs warmer callback " , ex);
            }
            _timer.Change(TimeSpan.FromSeconds(_secondsInterval), Timeout.InfiniteTimeSpan);
        }
        void OpenConnection()
        {
            var enabled = _settings.AppSettingsAsNullableBool("sitebuilder.nfswarmup.enabled").GetValueOrDefault(false);
            if (!enabled)
            {
                return;
            }
            var path = _settings.AppSettings("CertifiedPackageFileShare")?.Split(',').FirstOrDefault();
            var fs = GetFile(path);
            if ( _fileStream != null)
            {
                _fileStream.Dispose();
            }
            _fileStream = fs;
        }
        System.IO.FileStream GetFile ( string  dir)
        {
            foreach(var file in System.IO.Directory.GetFiles(dir))
            {
                try
                {
                    return System.IO.File.Open(file, System.IO.FileMode.Open, System.IO.FileAccess.Read, System.IO.FileShare.ReadWrite | System.IO.FileShare.Delete);
                }
                catch { }
            }
            foreach( var subDir in System.IO.Directory.GetDirectories(dir))
            {
                var fs = GetFile(subDir);
                if ( fs != null )
                {
                    return fs;
                }
            }
            return null;
        }

        void INfsConnectionWarmer.Start()
        {
            _timer.Change(TimeSpan.FromSeconds(1), Timeout.InfiniteTimeSpan);
        }

        void INfsConnectionWarmer.Stop()
        {
             _timer.Dispose();
        }
    }
}
