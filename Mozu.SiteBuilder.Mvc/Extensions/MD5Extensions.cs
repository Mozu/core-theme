using System;
using System.Security.Cryptography;
using System.Text;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class MD5Extensions
    {
        /// <summary>
        /// Joins an array of strings and returns the hash of the concatted string.
        /// </summary>
        public static string Encode(this MD5 md5, string[] input)
        {
            byte[] allTheBytes = ASCIIEncoding.ASCII.GetBytes( String.Join("", input) );
            string hashed = BitConverter.ToString( md5.ComputeHash(allTheBytes) );

            return hashed;
        }

        public static string ToHexString(this byte[] ba)
        {
            if (ba == null)
            {
                return string.Empty;
            }
            StringBuilder hex = new StringBuilder(ba.Length * 2);
            foreach (byte b in ba)
                hex.AppendFormat("{0:x2}", b);
            return hex.ToString();
        }
    }
}
