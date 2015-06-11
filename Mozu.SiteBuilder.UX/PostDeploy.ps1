# Alm.DeployPack Mozu.DeployWeb Project
function Update-ScaleUnit-In-AppSettings ([string]$ConfigFilePath, [String] $scaleUnitId )
{
	$xml = New-Object XML
	$xml.Load($ConfigFilePath)

	$xml.configuration.appSettings.add | 
		Where-Object { $_.key -eq 'ScaleUnitId' } | 
		ForEach-Object { $_.value = [string]$scaleUnitId }

	$xml.Save($ConfigFilePath)
	write-Host("Set scaleUnitId to $scaleUnitId in file $ConfigFilePath")
}

function install-counters($application, $dllPath)
{
	write-Host ("func install-counters: application = $application, dllPath = $dllPath")
	$dllPathNoQuotes = $dllPath.trim("`"")
	if (Test-Path -LiteralPath $dllPathNoQuotes -PathType Leaf) {
		$dotNetVer = "v4.0.30319"
		$dotNetRoot = (Get-ItemProperty HKLM:\software\Microsoft\.NETFramework).InstallRoot
		pushd
		cd "$dotNetRoot\$dotnetver"
		$installUtilExe = ".\InstallUtil.exe"
		$applicationName = "/ApplicationName=$application"
		write-Host ("func install-counters: iex -Command $installUtilExe $applicationName $dllPath")
		#& $installUtilExe $applicationName $dllPath #using try catch below instead to trap non-terminal errors
		Try	{
            $er = (Invoke-Expression -Command ("$installUtilExe $applicationName $dllPath")) 2>&1
	        if ($lastexitcode) {
				write-Host ("ERROR - func install-counters: Invoke-Expression of InstallUtil failed with non-terminal error lastexitcode = $lastexitcode")
                $er
                write-Error "ABORT SCRIPT"
			}
			write-Host ("func install-counters: InstallUtil successfully installed counters for: $dllPath")
        } Catch {
			$exName = $_.Exception.GetType().FullName
			write-Host ("ERROR - func install-counters: Invoke-Expression of InstallUtil exception $exName")
            $_
            throw "EXCEPTION"
        }
		popd
	} else {
		write-Host ("func install-counters: Warning - counter assmebly does not exist at: $dllPath")
		write-Host ("func install-counters: Warning - counter assembly cannot be installed")
	}
}

function get-web-application-poolName($octoPackageId)
{
	try
	{
		$poolPath = get-mozu-AppPoolPath($octoPackageId)
		$poolName = ( Get-WebApplication | ?{$_.PhysicalPath -eq $poolPath }).ApplicationPool 
		if (!$poolName) 
			{ 
				$poolName = ( Get-WebSite | ?{$_.PhysicalPath -eq $poolPath }).ApplicationPool 
				if (!$poolName)  { throw "Error - function get-web-application-poolName: no application pool for path: $poolPath found" }
			}
		return $poolName
	}    
	Catch
	{
		$ErrorMessage = $_.Exception.Message
		write-Host ("ErrorMessage = $ErrorMessage")
	}
}

function get-mozu-AppPoolPath($octoPackageId)
{
    Try
	{
		$applicationPaths = Get-WebApplication  | select -ExpandProperty PhysicalPath
		if (!$applicationPaths) { throw "Error - func get-mozu-AppPoolPath: no web applications with a physical path found on the server." }

		foreach($applicationPath in $applicationPaths)
		{
			write-Host ("func get-mozu-AppPoolPath: applicationPath = $applicationPath")
		}

		$poolPaths = $applicationPaths | where{$_ -like "*\$octoPackageId\*" }
		if (!$poolPaths) 
		{ 
			$sitePaths = Get-WebSite  | select -ExpandProperty PhysicalPath
			if (!$sitePaths) { throw "Error - func get-mozu-AppPoolPath: no sites with a physical path found on the server." }

			foreach($sitePath in $sitePaths)
			{
				write-Host ("func get-mozu-AppPoolPath: sitePath = $sitePath")
			}

			$poolPaths = $sitePaths | where{$_ -like "*\$octoPackageId\*" }
			if (!$poolPaths) { throw "Error - func get-mozu-AppPoolPath: no web application or site path found on the server that contain the Octopus Project Step Package ID: $octoPackageId"  }
		} 
    
		foreach($poolPath in $poolPaths)
		{
			write-Host ("func get-mozu-AppPoolPath: poolPath = $poolPath")
		}

		if ($poolPaths.count -gt 1) { throw "Error - func get-mozu-AppPoolPath: multiple pool locations for Octopus Project Package ID $octoPackageId" }
		$poolPath = $poolPaths #there is only one


		if (test-path $poolPath)
		{
			return $poolPath
		}
		else
		{ 
			Throw "Error - func get-mozu-AppPoolPath: can't find path of the application per physical path of the application pool "
		}
	}    
	Catch
	{
		$ErrorMessage = $_.Exception.Message
		write-Host ("ErrorMessage = $ErrorMessage")
	}
}

function Get-Version($filePath)
{
   $name = @{Name="Name";Expression= {split-path -leaf $_.FileName}}
   $path = @{Name="Path";Expression= {split-path $_.FileName}}
   $version = dir -recurse -path $filePath | % { if ($_.Name -match "(.*dll|.*exe)$") {$_.VersionInfo}} | select FileVersion, $name, $path
   return $version
}

function get-webApppool-status($poolName)
{
    $poolReturn = @()
    $poolStatus = gwmi win32_process -filter "Name like '%w3wp%'" | select name, Processid, commandline, creationdate
    foreach($status in $poolStatus)
    {
        if(($status.commandline) -like "*$poolName*" -and ($poolName))
        { 
            $status.creationdate = [System.Management.ManagementDateTimeConverter]::ToDateTime($status.creationdate)
            $poolReturn = $status
        }
        elseif (!$poolName)
        {
            $status.creationdate = [System.Management.ManagementDateTimeConverter]::ToDateTime($status.creationdate)
            $poolReturn += $status
        }
    }

    return $poolReturn.creationdate
}

function GetFumblerPage ([string] $fumblerUri)
{
	Try
	{
		write-Host ("func GetFumblerPage: Invoke-WebRequest Uri = '$fumblerUri'")
		$webapiStatus = (Invoke-WebRequest -Uri ("$fumblerUri") -UseBasicParsing -ErrorAction 'SilentlyContinue').StatusCode 

		if ($webapiStatus -ne "200")
		{
			write-Warning ("func GetFumblerPage: Invoke-WebRequest Uri = $fumblerUri webapiStatus ne 200")
			write-Host ("WebapiStatus = $webapiStatus")
			return $webapiStatus
		}
		else
		{
			return $webapiStatus
		}
		
	}
	Catch 
	{
		$webapiStatus = "-1"
		write-Warning ("func GetFumblerPage: Invoke-WebRequest EXCEPTION") 
		$ErrorMessage = $_.Exception.Message
		write-Host ("ErrorMessage = $ErrorMessage")
		write-Host ("func GetFumblerPage: webapiStatus = $webapiStatus")
		write-Host ("func GetFumblerPage: return and try alternate Uri")
		return $webapiStatus
	}
}

function GetAppSite ([string] $webUri)
{
	Try
	{
		write-Host ("func GetAppSite: Invoke-WebRequest Uri = $webUri")

		$webapiStatus = (Invoke-WebRequest -Uri ($webUri) -UseBasicParsing -ErrorAction 'SilentlyContinue').StatusCode 

		if($webapiStatus -ne "200") 
		{
			write-error ("func GetAppSite: ERROR Uri $webUri not = 200")
			return $webapiStatus
		}
		else
		{
			return $webapiStatus
		}
	}
	Catch 
	{
		$webapiStatus = "-1"
		write-Warning ("func GetAppSite: Invoke-WebRequest EXCEPTION") 
		$ErrorMessage = $_.Exception.Message
		write-Host ("ErrorMessage = $ErrorMessage")
		write-Host ("func GetAppSite: webapiStatus = $webapiStatus")
		write-Host ("func GetAppSite: return and ie automation to get redirected Uri")
		return $webapiStatus
	}
}

function GetPortFromPoolName ([string]$poolName)
{
	write-Host ("func GetPortFromPoolName: poolName = $poolName")
	$xPath = (Get-WebApplication | ? { $_.ItemXPath  -like "*$poolName*" }).ItemXPath 
	write-Host ("func GetPortFromPoolName: xPath = $xPath")
	$site = $xPath.Substring($xPath.IndexOf("site[@name='") + 12, ($xPath.IndexOf("' and @id=") - ($xPath.IndexOf("site[@name='") + 12)))
	write-Host ("func GetPortFromPoolName: site = $site")
	[string] $bi = (Get-WebBinding -Name $site).bindingInformation
	$bindings = $bi.Split(" ")
	if (!($bindings)) { Throw "Error - function GetPortFromPoolName: no bindings found."  }
    foreach ($binding in $bindings)
    {
		write-Host ("func GetPortFromPoolName: binding = $binding. Looking for *80*")
        if ($binding -like "*80*")
        {
            write-Host ("func GetPortFromPoolName: found target binding = $binding")
			$port = $binding.TrimStart('*')
			$port = $port.Trim(':')
			write-Host ("func GetPortFromPoolName: port = $port")
			return $port
        }
    }
	Throw "Error - function GetPortFromPoolName: no valid binding (*80*) found."
}

function GetHostHeaderFromPoolName ([string]$poolName)
{
	write-Host ("func GetHostHeaderFromPoolName: poolName = $poolName")
	$xPath = (Get-WebApplication | ? { $_.ItemXPath  -like "*$poolName*" }).ItemXPath 
	write-Host ("func GetHostHeaderFromPoolName: xPath = $xPath")
	$site = $xPath.Substring($xPath.IndexOf("site[@name='") + 12, ($xPath.IndexOf("' and @id=") - ($xPath.IndexOf("site[@name='") + 12)))
	write-Host ("func GetHostHeaderFromPoolName: site = $site")
	[string] $bi = (Get-WebBinding -Name $site).bindingInformation
	$bindings = $bi.Split(" ")
	if (!($bindings)) { Throw "Error - function GetHostHeaderFromPoolName: no bindings found."  }
    foreach ($binding in $bindings)
    {
		write-Host ("func GetHostHeaderFromPoolName: binding = $binding. Looking for *80*")
        if ($binding -like "*80*")
        {
			write-Host ("func GetHostHeaderFromPoolName: found target binding = $binding")
			[int]$i = $binding.LastIndexOf(":")
			$hostHeader= $binding.Substring($i)
			$hostHeader = $hostHeader.TrimStart(':')
			write-Host ("func GetHostHeaderFromPoolName: hostHeader = $hostHeader")
			return $hostHeader
        }
    }
	Throw "Error - function GetHostHeaderFromPoolName: no valid binding (*80*) found."
}

function CheckForHostHeader ([string]$poolName)
{
	write-Host ("func CheckForHostHeader: poolName = $poolName")
	$xPath = (Get-WebApplication | ? { $_.ItemXPath  -like "*$poolName*" }).ItemXPath 
	write-Host ("func CheckForHostHeader: xPath = $xPath")
	$site = $xPath.Substring($xPath.IndexOf("site[@name='") + 12, ($xPath.IndexOf("' and @id=") - ($xPath.IndexOf("site[@name='") + 12)))
	write-Host ("func CheckForHostHeader: site = $site")
	[string] $bi = (Get-WebBinding -Name $site).bindingInformation
	$bindings = $bi.Split(" ")
	if (!($bindings)) { Throw "Error - function CheckForHostHeader: no bindings found."  }
    foreach ($binding in $bindings)
    {
		write-Host ("func CheckForHostHeader: binding = $binding. Looking for *80*")
        if ($binding -like "*80*")
        {
            write-Host ("func CheckForHostHeader: found target binding = $binding")
			[int]$i = $binding.LastIndexOf(":") + 1 #will be equal to length if last character is a colon
			[int]$l = $binding.Length
			if ($l -gt $i)
			{
				$hasHeader = "true"
				write-Host ("func CheckForHostHeader: hasHeader = $hasHeader")
				return $hasHeader
			}
			else
			{
				$hasHeader = "false"
				write-Host ("func CheckForHostHeader: hasHeader = $hasHeader")
				return $hasHeader
			}
        }
    }
	Throw "Error - function CheckForHostHeader: no valid binding (*80*) found."
}

function get-mozu-appName($filename)
{
    $xml = [xml] (get-content $filename -ErrorAction 'SilentlyContinue') 
    if($xml)
    {
        $applicationName = $xml.configuration.appSettings.add | ?{$_.key -like "ApplicationName"} |select -ExpandProperty value
        $appName =  "`"$applicationName`""
        return $appname
    }
    else{ throw "can't find $filename"}
    popd
}

write-Host("START - Post-Deploy Script")
write-Host("START - Set Scale Units")
if($ScaleUnitId)
{
	$invocation = (Get-Variable MyInvocation).Value
	$directorypath = Split-Path $invocation.MyCommand.Path
	$webconfigpath = $directorypath + '\web.config'
	$binPath = $directorypath + '\bin'

	if(Test-Path $webconfigpath)
	{
		Update-ScaleUnit-In-AppSettings $webconfigpath $ScaleUnitId
	}

	$files = Get-ChildItem -Path $directorypath -Filter "*exe.config"
	foreach($file in $files)
	{
		Update-ScaleUnit-In-AppSettings $file.FullName $ScaleUnitId
	}

	if(Test-Path $binPath)
	{
		$files = Get-ChildItem -Path $binPath -Filter "*exe.config"
		foreach($file in $files)
		{
			Update-ScaleUnit-In-AppSettings $file.FullName $ScaleUnitId
		}
	}
}
write-Host("END - Set Scale Units")
write-Host(" ")

write-Host("START - Install counters")
$octoStepName = $OctopusParameters["Octopus.Step.Name"]


$octoPackageId = $OctopusParameters["Octopus.Action.Package.NuGetPackageId"]

write-Host("Get Variables - deployment will abort if any required variable values are missing")
if (!(
	 $octoProjName -and 
	 $octoStepName -and 
	 $octoPackageId
	 )) { throw ("Error: abort deployment: missing one or more web pre deploy variable values.") }






$poolPath = get-mozu-AppPoolPath($octoPackageId)
write-Host("Install counters - poolPath: $poolPath")
$appName = get-mozu-appName "$poolPath\web.config"
write-Host("Install counters - appName: $appName")
$countersAssemblyFiles = "$poolPath\bin\Mozu.Core.Api.dll", "$poolPath\bin\mozu.core.actions.dll"
foreach ($countersAssemblyFilePath in $countersAssemblyFiles)
{
	write-Host("Install counters - counters install loc: $countersAssemblyFilePath")
	install-counters $appName `"$countersAssemblyFilePath`"
}
write-Host("END - Install counters")
write-Host(" ")

write-Host("START - Restart application pool")
$poolName = get-web-application-poolName($octoPackageId)
write-Host("Restart application pool - poolName: $poolName")
$previousStart = get-webAppPool-status $poolName
write-Host("Restart application pool - previousStart: $previousStart")
Restart-WebAppPool -name $poolName
$currentStart = get-webAppPool-status $poolName
write-Host("Restart application pool - currentStart: $currentStart")
write-Host   ("$poolName previous start $previousStart restarted on $currentStart")
write-Host("END - Restart application pool")
write-Host(" ")

write-Host("START - Check if operational")
write-Host("Check if operational - checkHost: $checkHost")
if (!$checkHost) 
{ 
	Write-Warning("checkHost variable in Octopus project is null: add variable to project and set value to true. Script will default to true when variable is missing.") 
	$checkHost = "true"
}

if($checkHost -eq "true")
{
	$hasHeader = CheckForHostHeader $poolName
	if ($hasHeader -eq "true")
	{
		$hostHeader = GetHostHeaderFromPoolName $poolName
		$fumblerUri = ([string]::Format("http://{0}/{1}/mozdef/ping", $hostHeader, $poolName))
	}
	else
	{
		$port = GetPortFromPoolName $poolName
		$fumblerUri = ([string]::Format("http://{0}:{1}/{2}/mozdef/ping", $env:COMPUTERNAME, $port, $poolName))
	}

	$webapiStatus = GetFumblerPage $fumblerUri

	if ($webapiStatus -eq "200")
	{
		write-Host ("$fumblerUri is operational")
	}
	else
	{
		if ($hasHeader -eq "true")
		{
			$hostHeader = GetHostHeaderFromPoolName $poolName
			$webUri = ([string]::Format("http://{0}/{1}", $hostHeader, $poolName))
		}
		else
		{
			$port = GetPortFromPoolName $poolName
			$webUri = ([string]::Format("http://{0}:{1}/{2}", $env:COMPUTERNAME, $port, $poolName))
		}

		write-Host ("Try GetAppSite Invoke-WebRequest Uri = $webUri")
		$webapiStatus = GetAppSite $webUri
		write-Host ("WebapiStatus = $webapiStatus")
		if ($webapiStatus -eq "200")
		{
			write-Host ("$webUri is operational")
		}
		else
		{
			write-Error ("Unable to complete operational check")
		}
	}
}
else
{
	write-Host("Operational check not performed.")
}
write-Host("END - Check if operational")
write-Host("END - Post Deploy Script")