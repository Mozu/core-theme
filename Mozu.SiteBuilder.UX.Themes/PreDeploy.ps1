# Alm.DeployPack Mozu.DeployWeb Project
function get-mozu-AppPoolPath($octoProjName)
{
    Try
	{
		$applicationPaths = Get-WebApplication  | select -ExpandProperty PhysicalPath
		if (!$applicationPaths) 
		{ 
			write-Host "function get-mozu-AppPoolPath: Warning - no application pools with a physical path found on the server." 
			write-Host "function get-mozu-AppPoolPath: Warning - assume counters not installed." 
			return $null
		}

		foreach($applicationPath in $applicationPaths)
		{
			write-Host ("func get-mozu-AppPoolPath: applicationPath = $applicationPath")
		}

		$poolLocation = $applicationPaths | where{$_ -like "*$octoProjName*" }
		if (!$poolLocation) { throw "Error - function get-mozu-AppPoolPath: no application path found that contains the Octopus Project Name: $octoProjName" } 
    
		foreach($poolLoc in $poolLocation)
		{
			write-Host ("func get-mozu-AppPoolPath: poolLocation = $poolLoc")
		}

		if ($poolLocation.count -gt 1) { throw "Error - function get-mozu-AppPoolPath: multiple pool locations for $octoProjName" }

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
		write-Host ("function get-mozu-AppPoolPath: Get-WebApplication Exception Message = $ErrorMessage")
	}
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
    else
	{ 
		return $null 
	}
    popd
}

write-Host("START - Pre-Deploy Script")
write-Host("START - Show Prior Deploy Information")
$octoProjName = $OctopusParameters["Octopus.Project.Name"]
write-Host("Application Deployments:")
$poolLocation = get-mozu-AppPoolPath($octoProjName)
if ($poolLocation)
{
	$appName = get-mozu-appName "$poolLocation\web.config"
	if ($appName)
	{
		write-Host("$appName Prior Deployment: $poolLocation")
	}
	else
	{
		write-Host("Web application set up, but not yet deployed")
	}
}
else { write-Host("No prior deployment found: Web application not yet setup on this machine.") }

write-Host("END - Show Prior Deploy Information")
write-Host("END - Pre-Deploy Script")