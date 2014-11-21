@echo off
cd /d "%~dp0"
set PATH=%USERPROFILE%\AppData\Roaming\npm;%path%

where jshint.cmd 
IF %ERRORLEVEL% EQU 0 (
echo jshint found
)else  (
call npm install jshint -g
)
echo running jshint

call jshint.cmd app --config tfsbuild.jshintrc --exclude-path tfsbuild.jshintignore --verbose
echo finished jshint
