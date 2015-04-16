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
	$dotNetVer = "v4.0.30319"
    $dotNetRoot = (Get-ItemProperty HKLM:\software\Microsoft\.NETFramework).InstallRoot
    pushd
    cd "$dotNetRoot\$dotnetver"
    $output = Invoke-Expression -command ".\InstallUtil.exe /ApplicationName=$application $dllPath 2>&1"
    popd
}

function get-web-application-poolName($octoProjName)
{
	try
	{
		$poolLocation = get-mozu-AppPoolPath($octoProjName)
		$poolName = (Get-WebApplication | ?{$_.PhysicalPath -eq $poolLocation }).ApplicationPool 
		if (!$poolName) { throw "Error - function get-web-application-poolName: no application pool value found" }
		return $poolName
	}    
	Catch
	{
		$ErrorMessage = $_.Exception.Message
		write-Host ("ErrorMessage = $ErrorMessage")
	}
}

function get-mozu-AppPoolPath($octoProjName)
{
    Try
	{
		$applicationPaths = Get-WebApplication  | select -ExpandProperty PhysicalPath
		if (!$applicationPaths) { throw "Error - function get-mozu-AppPoolPath: no application pools with a physical path found on the server." }

		$poolLocation = $applicationPaths | where{$_ -like "*$octoProjName*" }
		if (!$poolLocation) { throw "Error - function get-mozu-AppPoolPath: no application path found that contains the Octopus Project Name: $octoProjName" } 
    
		if (test-path $poolLocation)
		{
			return $poolLocation
		}
		else
		{ 
			Throw "Error - function get-mozu-AppPoolPath: can't find path of the application per physical path of the application pool "
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
		write-Host ("function - GetFumblerPage: Invoke-WebRequest Uri = '$fumblerUri'")
		$webapiStatus = (Invoke-WebRequest -Uri ("$fumblerUri") -UseBasicParsing -ErrorAction 'SilentlyContinue').StatusCode 

		if ($webapiStatus -ne "200")
		{
			write-Warning ("function - GetFumblerPage: Invoke-WebRequest Uri = $fumblerUri webapiStatus ne 200")
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
		write-Warning ("function - GetFumblerPage: Invoke-WebRequest EXCEPTION") 
		$ErrorMessage = $_.Exception.Message
		write-Host ("ErrorMessage = $ErrorMessage")
		write-Host ("function - GetFumblerPage: webapiStatus = $webapiStatus")
		write-Host ("function - GetFumblerPage: return and try alternate Uri")
		return $webapiStatus
	}
}

function GetAppSite ([string] $webUri)
{
	Try
	{
		write-Host ("function - GetAppSite: Invoke-WebRequest Uri = $webUri")

		$webapiStatus = (Invoke-WebRequest -Uri ($webUri) -UseBasicParsing -ErrorAction 'SilentlyContinue').StatusCode 

		if($webapiStatus -ne "200") 
		{
			write-error ("function - GetAppSite: ERROR Uri $webUri not = 200")
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
		write-Warning ("function - GetAppSite: Invoke-WebRequest EXCEPTION") 
		$ErrorMessage = $_.Exception.Message
		write-Host ("ErrorMessage = $ErrorMessage")
		write-Host ("function - GetAppSite: webapiStatus = $webapiStatus")
		write-Host ("function - GetAppSite: return and ie automation to get redirected Uri")
		return $webapiStatus
	}
}

function GetPortFromPoolName ([string]$poolName)
{
	write-Host ("function - GetPortFromPoolName: poolName = $poolName")
	$xPath = (Get-WebApplication | ? { $_.ItemXPath  -like "*$poolName*" }).ItemXPath 
	write-Host ("function - GetPortFromPoolName: xPath = $xPath")
	$site = $xPath.Substring($xPath.IndexOf("site[@name='") + 12, ($xPath.IndexOf("' and @id=") - ($xPath.IndexOf("site[@name='") + 12)))
	write-Host ("function - GetPortFromPoolName: site = $site")
	[string] $bi = (Get-WebBinding -Name $site).bindingInformation
	$bindings = $bi.Split(" ")
	if (!($bindings)) { Throw "Error - function GetPortFromPoolName: no bindings found."  }
    foreach ($binding in $bindings)
    {
		write-Host ("function - GetPortFromPoolName: binding = $binding. Looking for *80*")
        if ($binding -like "*80*")
        {
            write-Host ("function - GetPortFromPoolName: found target binding = $binding")
			$port = $binding.TrimStart('*')
			$port = $port.Trim(':')
			write-Host ("function - GetPortFromPoolName: port = $port")
			return $port
        }
    }
	Throw "Error - function GetPortFromPoolName: no valid binding (*80*) found."
}

function GetHostHeaderFromPoolName ([string]$poolName)
{
	write-Host ("function - GetHostHeaderFromPoolName: poolName = $poolName")
	$xPath = (Get-WebApplication | ? { $_.ItemXPath  -like "*$poolName*" }).ItemXPath 
	write-Host ("function - GetHostHeaderFromPoolName: xPath = $xPath")
	$site = $xPath.Substring($xPath.IndexOf("site[@name='") + 12, ($xPath.IndexOf("' and @id=") - ($xPath.IndexOf("site[@name='") + 12)))
	write-Host ("function - GetHostHeaderFromPoolName: site = $site")
	[string] $bi = (Get-WebBinding -Name $site).bindingInformation
	$bindings = $bi.Split(" ")
	if (!($bindings)) { Throw "Error - function GetHostHeaderFromPoolName: no bindings found."  }
    foreach ($binding in $bindings)
    {
		write-Host ("function - GetHostHeaderFromPoolName: binding = $binding. Looking for *80*")
        if ($binding -like "*80*")
        {
			write-Host ("function - GetHostHeaderFromPoolName: found target binding = $binding")
			[int]$i = $binding.LastIndexOf(":")
			$hostHeader= $binding.Substring($i)
			$hostHeader = $hostHeader.TrimStart(':')
			write-Host ("function - GetHostHeaderFromPoolName: hostHeader = $hostHeader")
			return $hostHeader
        }
    }
	Throw "Error - function GetHostHeaderFromPoolName: no valid binding (*80*) found."
}

function CheckForHostHeader ([string]$poolName)
{
	write-Host ("function - CheckForHostHeader: poolName = $poolName")
	$xPath = (Get-WebApplication | ? { $_.ItemXPath  -like "*$poolName*" }).ItemXPath 
	write-Host ("function - CheckForHostHeader: xPath = $xPath")
	$site = $xPath.Substring($xPath.IndexOf("site[@name='") + 12, ($xPath.IndexOf("' and @id=") - ($xPath.IndexOf("site[@name='") + 12)))
	write-Host ("function - CheckForHostHeader: site = $site")
	[string] $bi = (Get-WebBinding -Name $site).bindingInformation
	$bindings = $bi.Split(" ")
	if (!($bindings)) { Throw "Error - function CheckForHostHeader: no bindings found."  }
    foreach ($binding in $bindings)
    {
		write-Host ("function - CheckForHostHeader: binding = $binding. Looking for *80*")
        if ($binding -like "*80*")
        {
            write-Host ("function - CheckForHostHeader: found target binding = $binding")
			[int]$i = $binding.LastIndexOf(":") + 1 #will be equal to length if last character is a colon
			[int]$l = $binding.Length
			if ($l -gt $i)
			{
				$hasHeader = "true"
				write-Host ("function - CheckForHostHeader: hasHeader = $hasHeader")
				return $hasHeader
			}
			else
			{
				$hasHeader = "false"
				write-Host ("function - CheckForHostHeader: hasHeader = $hasHeader")
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
		# the convention .Mozu application name is by design and used to that the list of mozu counters sorts to the top in the perf counter UI
        $appName =  "`".Mozu $applicationName`""
        return $appname
    }
    else{ throw "can't find installutil"}
    popd
}

write-Host("START - Post-Deploy Script")
$TeamFoundationBuildService = Get-Service -DisplayName ("*Team Foundation Build Service*")
if ($TeamFoundationBuildService)
{
	write-Host("TeamFoundationBuildService found on $env:COMPUTERNAME")
	write-Host("Assumed to be a build machine. Exit post-deploy script")
	write-Host("END - Post Deploy Script")
	Exit
}
else 
{
	write-Host("TeamFoundationBuildService not found on $env:COMPUTERNAME")
	write-Host("$env:COMPUTERNAME not a TFS build machine")
	write-Host("Continue with post-deploy script execution")
	write-Host(" ")
}
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
$octoProjName = $OctopusParameters["Octopus.Project.Name"]
$poolLocation = get-mozu-AppPoolPath($octoProjName)
write-Host("Install counters - poolLocation: $poolLocation")
$countersInstallLoc = "$poolLocation\bin\Mozu.Core.Api.dll"
write-Host("Install counters - counters install loc: $countersInstallLoc")
$appName = get-mozu-appName "$poolLocation\web.config"
write-Host("Install counters - appName: $appName")
$verDeployed = get-version $countersInstallLoc
write-Host("Install counters - verDeployed: $verDeployed")
[version]$currVersion = $verDeployed.FileVersion
write-Host("Install counters - currVersion: $currVersion")
[version]$minVersion =  "1.7.0.1"
write-Host("Install counters - minVersion: $minVersion")
if($currVersion -gt $minVersion)
{
	install-counters $appName `"$countersInstallLoc`"
}
write-Host("END - Install counters")
write-Host(" ")

write-Host("START - Restart application pool")
$poolName = get-web-application-poolName($octoProjName)
write-Host("Restart application pool - poolName: $poolName")
$previousStart = get-webAppPool-status $poolName
write-Host("Restart application pool - previousStart: $previousStart")
Restart-WebAppPool -name $poolName
$currentStart = get-webAppPool-status $poolName
write-Host("Restart application pool - currentStart: $currentStart")
write-host   ("$poolName previous start $previousStart restarted on $currentStart")
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
		Write-host ("$fumblerUri is operational")
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
			Write-host ("$webUri is operational")
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