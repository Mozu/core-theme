@echo off
:: get the directory in which the script reside
set DIR=%~dp0

"%DIR%\siesta-1.1.8-standard\bin\binary\phantomjs-1.6.0-win32-static\phantomjs.exe" "--cookies-file=%DIR%\admincookies.txt" "%DIR%\siesta-1.1.8-standard\bin\admin-tests.js" "%DIR%/" %*