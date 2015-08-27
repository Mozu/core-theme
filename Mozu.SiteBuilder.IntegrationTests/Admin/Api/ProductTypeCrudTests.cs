using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Text;
using NUnit.Framework;

namespace Mozu.SiteBuilder.IntegrationTests.Admin.Api
{
    [TestFixture]
    public class ProductTypeCrudTests
    {

        [Ignore, TestCase("")]
        public void When_Name_Exceeds_50_Characters_Then_Should_Give_Informational_Error(string scenario)
        {
            //arrange


            //act
            MakeRequests();
            
            //assert

        }


        private void MakeRequests()
        {
            HttpWebResponse response;
            string responseText;

            if (Request_t123_mozu_qa_com(out response))
            {
                responseText = ReadResponse(response);

                response.Close();
            }
        }

        private static string ReadResponse(HttpWebResponse response)
        {
            using (Stream responseStream = response.GetResponseStream())
            {
                Stream streamToRead = responseStream;
                if (response.ContentEncoding.ToLower().Contains("gzip"))
                {
                    streamToRead = new GZipStream(streamToRead, CompressionMode.Decompress);
                }
                else if (response.ContentEncoding.ToLower().Contains("deflate"))
                {
                    streamToRead = new DeflateStream(streamToRead, CompressionMode.Decompress);
                }

                using (StreamReader streamReader = new StreamReader(streamToRead, Encoding.UTF8))
                {
                    return streamReader.ReadToEnd();
                }
            }
        }

        private bool Request_t123_mozu_qa_com(out HttpWebResponse response)
        {
            response = null;

            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create("http://sb.mozu-qa.com/admin/app/ProductType/create?_dc=1392138173813");

                request.KeepAlive = true;
                request.Headers.Add("x-vol-master-catalog", @"2");
                request.Headers.Add("Origin", @"https://t123.mozu-qa.com");
                request.UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1700.107 Safari/537.36";
                request.ContentType = "application/json";
                request.Accept = "*/*";
                request.Headers.Add("X-Requested-With", @"XMLHttpRequest");
                request.Headers.Add("x-vol-tenant", @"123");
                request.Headers.Add("x-vol-app-claims", @"ol/HS8qQHm60HvyjSBrTHEIocN/Rduc5zBta42di3uOBLbdbyc+ucDjFokptQcBlV6JUd+jsiBhb7DHD4arKixKsKK3SODKkwyfUw2P2y1IXq3WuzQKZcN9YTCows4T6niIX7F3ZmtS4aFqSrpdaW3+37f0OKJ2rZVUTFpCzbfGpQAY63yIeE4A9br/Y5wVYUa8ZtC6PnnNg+BZdrbgklX2TVrqk4pyQQ5sGzeaYSQJ/W/XCVldfVHMc8STa++R0L0lGIGnXEPYfBdyW+wB2rz9K0aSXDcSKWvSJqUAIEoUSsxFJX7xUKJS3iyHxYNbteFZRAFwgcrXKZbnIKr/3iVMNIyEIjtu42rr2hNf1PrCLKgf7IsX4l7r58YGcztMsydQDlTVfUavy68s49DpUo6aMjZqYxmkuaP+CYuCfSIA=");
                request.Headers.Add("x-vol-user-claims", @"K6r3S9E4rk766fAOhYAIi+xZpOeFz4ID/VystzMRTFS98Wi4CAtDJEEcvct22Ub+hfaR1wS0yin9iyMZifr9lwVasbQxxbjAcPx6jbCH3Qb2Y0LupxaH7RfLYhZwTN6MuVWEYQ6I8RzbgfbEpGfyfbvGY1sRp3S5V16h09GjgLJZUCYTolc4RXjl7JCcVISVLotloK05f0THfRWU73UQb5G/Unk2gD8yzN3xgJF5tW6QUi5UyMMOeqxmhbW3uMbi/DjpW78T6anww9E/NYqGH0xjx+s0/jgtbhkUDBZMkVqLBeFur/+woSWOmIwwepoKPDfo7hrfX+/GoDKV01h1ivpLIqHj0EBdk96GSs0ksGehHps9Q9qR/WSPwPhhlecMkxt+GqnK+0EhSgyYY2grZPTB8kw89Fi7QQtn5k1uspPhott6vl0rkwXUsaPWGPezEbvwr7rdNxwTPTXo49IlJStOJQegMoSBjTwFPAbp6GI=");
                request.Referer = "https://t123.mozu-qa.com/Admin/m-2/producttypes/create";
                request.Headers.Set(HttpRequestHeader.AcceptEncoding, "gzip,deflate,sdch");
                request.Headers.Set(HttpRequestHeader.AcceptLanguage, "en-US,en;q=0.8");
                //request.Headers.Set(HttpRequestHeader.Cookie, @"mzrt-qa=Token=1fd3265450cc491a9a6776f2fae466a0&Expiration=635278212090163617&User=JZPwlFO2EMplF5BG0RYpQtv4GJwYyYZnvDc1GfBOLHzQOyBhf8Hqe10uETP+6Xz1UEyaLnhqSrhjukKK0vEWt0IghS3679AnE79wtIqfZBETj6gp1ezBozfpphNEjAAZS1Tu9PShz8cirPBkSfdCHg==; SBCONTEXT=site=&masterCatalog=&tenant=123&editmode=False; sb-admin-at-QA=at=ilCx8DOKUJ8nEFwwrXgBB/tyYQJ5gv6vgWhjDU1L4lzPUVDXjfZxB5u1yA3ajSardTAa4V3jCiX1niHQqyysd6dlDLIb1YSKm6zsUeijoOR9C4o3m2BAhma89KuZjUuHCSuwapL4UD4U2QImukKhvsfKK+QgZ3VOTswh8x7rB3iyfd7GYh7W/GRPZ8MouGpJUIFzvEOr+iA/aVzk+T2CODlcSL+FurDFvwp0cFqL9UZJKUJa5QiIeRxcfHTxuusMakhQju6A2ett5tBD0/Ava1KBv2/ugmwOQG2gvzGnrvezaNdoI9M7AYkwVM0ThpqkzR6wkwJZnQORg7Hjhx2zTjoCAT8sVkt8nOTBvv6De2EVwNFv4Z7WTazqAffaAy018ZWBjJFesJzX1IftBHxCuBIALx3oyYZmo91qAHsYRIsKFh8iD/TigEIhdcElhlFDuX3+C9byfgk+rQb//5qjWsRb9GUVQjhpBAsY4079OZ8=");

                request.Method = "POST";
                request.ServicePoint.Expect100Continue = false;

                string body = @"[{""name"":""12P-13P-14P-15P-16P-17P-18P-19P-20P-21P-22P-23P-24P-"",""isBase"":false,""options"":[],""numberOfProducts"":0,""extras"":[],""properties"":[{""attributeFQN"":""tenant~12P_"",""index"":0,""isLocked"":false,""isRequired"":true,""allowMulti"":true,""isHidden"":true,""selectedValues"":[{""id"":""61"",""value"":61},{""id"":""62"",""value"":62}],""dataType"":""Number"",""inputType"":""List""},{""attributeFQN"":""tenant~13P_"",""index"":0,""isLocked"":false,""isRequired"":true,""allowMulti"":true,""isHidden"":true,""selectedValues"":[{""id"":""E61"",""value"":""E61""},{""id"":""E62"",""value"":""E62""}],""dataType"":""String"",""inputType"":""List""},{""attributeFQN"":""tenant~14P_"",""index"":0,""isLocked"":false,""isRequired"":true,""allowMulti"":true,""isHidden"":true,""selectedValues"":[{""id"":""81"",""value"":81},{""id"":""82"",""value"":82}],""dataType"":""Number"",""inputType"":""List""},{""attributeFQN"":""tenant~15P_"",""index"":0,""isLocked"":false,""isRequired"":true,""allowMulti"":true,""isHidden"":true,""selectedValues"":[{""id"":""E81"",""value"":""E81""},{""id"":""E82"",""value"":""E82""}],""dataType"":""String"",""inputType"":""List""},{""attributeFQN"":""tenant~16P_"",""index"":0,""isLocked"":false,""isRequired"":true,""allowMulti"":false,""isHidden"":true,""selectedValues"":[],""dataType"":""DateTime"",""inputType"":""Date""},{""attributeFQN"":""tenant~17P_"",""index"":0,""isLocked"":false,""isRequired"":true,""allowMulti"":true,""isHidden"":true,""selectedValues"":[{""id"":""101"",""value"":101},{""id"":""102"",""value"":102}],""dataType"":""Number"",""inputType"":""List""},{""attributeFQN"":""tenant~18P_"",""index"":0,""isLocked"":false,""isRequired"":true,""allowMulti"":true,""isHidden"":true,""selectedValues"":[{""id"":""E101"",""value"":""E101""},{""id"":""E102"",""value"":""E102""}],""dataType"":""String"",""inputType"":""List""},{""attributeFQN"":""tenant~19P_"",""index"":0,""isLocked"":false,""isRequired"":true,""allowMulti"":true,""isHidden"":true,""selectedValues"":[{""id"":""111"",""value"":111},{""id"":""112"",""value"":112}],""dataType"":""Number"",""inputType"":""List""},{""attributeFQN"":""tenant~20P_"",""index"":0,""isLocked"":false,""isRequired"":true,""allowMulti"":true,""isHidden"":true,""selectedValues"":[{""id"":""E111"",""value"":""E111""},{""id"":""E112"",""value"":""E112""}],""dataType"":""String"",""inputType"":""List""},{""attributeFQN"":""tenant~21P_"",""index"":0,""isLocked"":false,""isRequired"":true,""allowMulti"":false,""isHidden"":true,""selectedValues"":[],""dataType"":""String"",""inputType"":""TextArea""},{""attributeFQN"":""tenant~22P_"",""index"":0,""isLocked"":false,""isRequired"":true,""allowMulti"":false,""isHidden"":true,""selectedValues"":[],""dataType"":""Number"",""inputType"":""TextBox""},{""attributeFQN"":""tenant~23P_"",""index"":0,""isLocked"":false,""isRequired"":true,""allowMulti"":false,""isHidden"":true,""selectedValues"":[],""dataType"":""String"",""inputType"":""TextBox""},{""attributeFQN"":""tenant~24P_"",""index"":0,""isLocked"":false,""isRequired"":true,""allowMulti"":false,""isHidden"":true,""selectedValues"":[],""dataType"":""Bool"",""inputType"":""YesNo""}],""productUsages"":[""Standard"",""Configurable"",""Bundle"",""Component""],""modifiedDate"":null}]";
                byte[] postBytes = System.Text.Encoding.UTF8.GetBytes(body);
                request.ContentLength = postBytes.Length;
                Stream stream = request.GetRequestStream();
                stream.Write(postBytes, 0, postBytes.Length);
                stream.Close();

                response = (HttpWebResponse)request.GetResponse();
            }
            catch (WebException e)
            {
                if (e.Status == WebExceptionStatus.ProtocolError) response = (HttpWebResponse)e.Response;
                else return false;
            }
            catch (Exception)
            {
                if (response != null) response.Close();
                return false;
            }

            return true;
        }
    }


}