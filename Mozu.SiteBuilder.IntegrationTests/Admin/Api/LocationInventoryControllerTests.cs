using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core;
using Mozu.Core.Settings;
using NSubstitute;
using NUnit.Framework;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
{

    [TestFixture]
    public class LocationInventoryControllerTests
    {

        private ISettings _settings = new MozuSettings();

        //[SetUp]
        public void SetUp()
        {
            //_settings = new 
            _settings = NSubstitute.Substitute.For<ISettings>();
            _settings.AppSettings("Environment").Returns("ci");
            _settings.AppSettings("ScaleUnitId").Returns("tp1");
            _settings.AppSettings("mozu_core_settings_path").Returns("c:/configs");
        }

        //[TestCase("first", 9582, 13595, 1, 1, "mozuqa@volusion.com", "qateam1!")]
        public void When_Given_X_Then_Y(string scenario, int tenantId, int? siteId, int? masterCatalog, int? catalog, string email="mozuqa@volusion.com", string pw="qateam1!")
        {
            //arrange
            var userScope = new UserScope
            {
                Id = tenantId,
                Name = email,
                Type = UserScopeType.Tenant
            };

            var authCookie = TestUtility.GetAuthCookie(_settings, userScope, siteId, masterCatalog, catalog, email, pw);
               
                //siteId = siteId,
                //masterCatalogId = masterCatalogId,

                //email, 
                //pw);
            
            var apiRequest = new ApiGetRequest
                {
                    TenantId = tenantId,
                    SiteId = siteId,
                    MasterCatalogId = 1,
                    CatalogId = 1,
                    Url = "http://sb.volusion.com/admin/app/locationinventory/forproduct?productCode=bNMpK",
                    AuthCookie = authCookie
                };

            //act
            var actual = ApiUtil.Get(apiRequest);

            //assert
            Assert.That(actual, Is.Not.Null, scenario);
            //request.Headers.Add("x-vol-master-catalog", @"1");                
            //request.Headers.Add("x-vol-site", @"13595");
            //request.Headers.Add("x-vol-tenant", @"9582");
            //request.Headers.Add("x-vol-catalog", @"1");
        }


        //private void MakeRequests()
        //{
        //    HttpWebResponse response;
        //    string responseText;

        //    if (Request_sb_volusion_com(out response))
        //    {
        //        responseText = ReadResponse(response);

        //        response.Close();
        //    }
        //}

        //private static string ReadResponse(HttpWebResponse response)
        //{
        //    using (Stream responseStream = response.GetResponseStream())
        //    {
        //        Stream streamToRead = responseStream;
        //        if (response.ContentEncoding.ToLower().Contains("gzip"))
        //        {
        //            streamToRead = new GZipStream(streamToRead, CompressionMode.Decompress);
        //        }
        //        else if (response.ContentEncoding.ToLower().Contains("deflate"))
        //        {
        //            streamToRead = new DeflateStream(streamToRead, CompressionMode.Decompress);
        //        }

        //        using (StreamReader streamReader = new StreamReader(streamToRead, Encoding.UTF8))
        //        {
        //            return streamReader.ReadToEnd();
        //        }
        //    }
        //}

        //private bool Request_sb_volusion_com(out HttpWebResponse response)
        //{
        //    response = null;

        //    try
        //    {
        //        HttpWebRequest request =
        //            (HttpWebRequest)
        //                WebRequest.Create(
        //                    "http://sb.volusion.com/admin/app/locationinventory/forproduct?productCode=bNMpK");

        //        request.KeepAlive = true;
        //        request.Headers.Add("x-vol-master-catalog", @"1");
        //        request.UserAgent =
        //            "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36";
        //        request.Headers.Add("x-vol-site", @"13595");
        //        request.Accept = "*/*";
        //        request.Headers.Add("X-Requested-With", @"XMLHttpRequest");
        //        request.Headers.Add("x-vol-tenant", @"9582");
        //        request.Headers.Add("x-vol-catalog", @"1");
        //        request.Referer = "http://sb.volusion.com/admin/s-13595/orders/edit/042bdd8c4fdce005a84fd4790000256e";
        //        request.Headers.Set(HttpRequestHeader.AcceptEncoding, "gzip,deflate,sdch");
        //        request.Headers.Set(HttpRequestHeader.AcceptLanguage, "en-US,en;q=0.8");
        //        request.Headers.Set(HttpRequestHeader.Cookie,
        //            @"mzrt-dev=Token=58bb6d1127eb45b3a43ded95a16fd332&Expiration=635254160571780153&User=JZPwlFO2EMplF5BG0RYpQtv4GJwYyYZnvDc1GfBOLHzmiiCIQK+CPKjPRotPO4g3A4einw51pS6x6umNEp+pzWdvjcxOv9d6hRSy4zPxpg38/CLqWTSpLEMu0vNwsn/h; optimizelyEndUserId=oeu1390243079192r0.2586147403344512; optimizelyCustomEvents=%7B%22oeu1390243079192r0.2586147403344512%22%3A%5B%22gallery_clicks%22%5D%7D; mozuDevCenterAuth=; debugext=true; mzrt-SI=Token=8d6c8ee39f9243d6a873ea1c2596214c&Expiration=635315504250740000&User=JZPwlFO2EMplF5BG0RYpQtv4GJwYyYZnvDc1GfBOLHzQOyBhf8Hqe10uETP+6Xz1UEyaLnhqSrhjukKK0vEWt5Mat+2nE6rnNXBKQLpUo8FyAY5ORj7BarMhbeJ5rIlm4e9aGNnhjaB2LmE/CDH2Zg==; sb-admin-at-SI=at=cvb53OognsIkSaIlOYR6tsqVoWqKS3xXR69yWEdd83cbg2N8wFzKKUB7ae4KHLxJfzw00DWNh4PKNVRbi7Y6pHOBHkEDSYSvLKQvxqQ9G5SPBT/YEefFsuBOjqzxtEOIG/WHr0vtXKUSQtX8ln/mXhuxYQHdYCKxYnnio6qMwWf9sKgxOckIcSsipjgfzd4ORYl8KhkYs5BRt+LocI3ICFJiwSjBYiseHmzk6UU14NKnZ74dKXE97xiwid3UULGg2/q0njKGwjRFxeQFOzb76pngi4dwdIVrA2dWFzHAPtSn1jpeQHChd5MIysf6lKemvJGXVxgCGqteL/qjgAMlQQgyBOU8tW+Sy/C32y+c9GPjUvK7khoZL3tc9bRDhEQqkllYuUW0+qV2KFEAf/AsiVeh8f+L47KlfuEmxntmWgxRucHOyF3/nkZlADUq2+2Dk9zN+eNhykTxI4C8ygfTyw==; sb-sf-at-SI=pt=JZPwlFO2EMplF5BG0RYpQtLXsDBelYo+COJcpm/d7QSYxim3OYeJuuxcTOdclEaLRz0sUw7LIxPiPhsK7AHISIrqqQUb++COIXbcPgNN3lSET6+jyd25KL9NBi+dCTJegWYpAPcYiFRxZq/IcmaUtSD8yOYBUkmEwbYh9FBCQhs=&at=lbaTTADCmP4zXdrFQLw9i/yKzlqxGl8D5j4qDN8qqlyGWmtGcGhD5wQ9w9brEBDmDYLsd8ouD1wJ64JK98xrfH1iMJFGCX8Mcrdy1TVmAZO/XNhCrqjGX4ULGDRmUEy7JhmLka+JOU2tSp3KD59e1wkolETYBNbqHBoMYGiF0Z9ZjsYFBw5BUd+q2TbWIkkjjmwiDW6KYtmf9Dg14mDPAwFRlwLu+03tzD8xZhlGJsE=; sb-admin-at-QA=at=XFOPialm1MFFHvot/jnnWMCspCbCFffuE+KknwvRP+3teAfSfWQJR8GcnJsk2U0Kwn6+AeMpqQPeXtsM21G8TEJnh5fEjZ7YT4fcC4ufDWf3hbTzmKOKMmK0ayFwRzghG3GwZj+TzYB2cS7AUwBLaDxeeHCkp8qq65mRip2Bo8KAOU+7GP7qnaYq2c9tA1poBvXDHc/CmOyT41ZhQpCET5TN7L/G/Hjmq46HUFnoxNFkKJSEForktSf6BxoflxAw/o/+pQhDJctai6pRW75tJS4LULd65I+fhd+FHDAbNWOXE7WiCsY9CA8A1qbu+liYhAt/DiXgzob+6jhRHmFK4fb0H7QPoDX7LYtdCWEljHnjjuPCpahxaT6IoXlji3mnwjYeroah4yAKWIFXO2IgnQj5Uu6VPTBZvxHR/bERXABb2aZ1I40JFM4YSc/Fcg78L5dtjBWfR6X0KiTsIDalOQ==; optimizelySegments=%7B%22400030121%22%3A%22gc%22%2C%22401210090%22%3A%22referral%22%2C%22401990081%22%3A%22false%22%7D; optimizelyBuckets=%7B%7D; __utma=1.1089434206.1382975816.1398365978.1400522600.9; __utmc=1; __utmz=1.1382975816.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _ga=GA1.2.1089434206.1382975816; _mkto_trk=id:702-MYH-396&token:_mch-volusion.com-1382975816029-33198; mzrt-CI=Token=a4a267a476a04fda8dc0a932b335ea7a&Expiration=635362237735170000&User=JZPwlFO2EMplF5BG0RYpQtv4GJwYyYZnvDc1GfBOLHzQOyBhf8Hqe10uETP+6Xz1UEyaLnhqSrhjukKK0vEWtzU33KVL2ZoyhlpiujD5e0c4NHW4lQDvDsfKn/1rUPl1SNTusttf7AR+RRwC7eJySw==; sb-admin-at-CI=at=gFxBnAxljjgb8lOiRrdwRErnNM+EW2pV51qx8KbXzi6/bUmXVUvjGZFB/O7ivnU2PUR76fvCKAVxM+F/cbUgoF2Asi9j7L8woB3Jz9Ul43EsaGbl2u8E905GBVZM5QN2OyygNSRTDm+wz7GoZtcRoqz1mH9VuYEnK77JUzLW1CqoZKWycRafyalJ+0xLVT7AC5bPoZV+BP+Gi3rePN/wegUqchBAGlUB91i6BsV8P04SR5iMyC9i2jAlJAnsFHCPSDUq6APfjtsOaHbLa+KBC2LZZci9bPdoFBsdSGDN1+Q60LrbQBoZW+2xGR3Ju0g7/TPN+b35XhSwBAbVmCE+9DPhMGR5x8e5/J7i0K4pKbCJc3zHnak0teoP/tKXyKCspQ4AHqZ80EqSpebQclEdXEN5kAIM2nukben2FZkkKnfRR8xAfPq+RbjzQIwtXKTSe/f65p9S6eZfoDxbrY1qUg==; _mzvr=CV0-O1eGwUS0KQXIEmGqXA; sb-sf-at-CI=pt=&at=b8HNe6Kh1xT3eSFqdBgXAc8UHF9Nbko9HIVVa20+00d3Ikt0mC2bDHz08SQwXZz6MZq5k79NO6+JyQplPHQN/h4DdndGiI1K07/Em2OCQ/5lsD319yWNXknKplve8XKjQ6i/pY47LCH0eYmUuc4DzN5/JZYN7yCWcqal7TwvS2B0gUOuBMBdDb8oe8P4FQzCf6LqP8aG6tThKjnQNobfRg==; _mzvs=yn; SBCONTEXT=site=13595&masterCatalog=1&catalog=1&tenant=9582&editmode=False&dataview=Pending; mozucartcount=1; _mzvt=K9CXQBZhSUae-8y5nFaXkQ");

        //        response = (HttpWebResponse)request.GetResponse();
        //    }
        //    catch (WebException e)
        //    {
        //        if (e.Status == WebExceptionStatus.ProtocolError) response = (HttpWebResponse)e.Response;
        //        else return false;
        //    }
        //    catch (Exception)
        //    {
        //        if (response != null) response.Close();
        //        return false;
        //    }

        //    return true;
        //}
    }
}
