

function Update-ScaleUnit-In-AppSettings ([string]$ConfigFilePath, [string] $scaleUnitId )
{
	$xml = New-Object XML
	$xml.Load($ConfigFilePath)

	$xml.configuration.appSettings.add | 
		Where-Object { $_.key -eq 'ScaleUnitId' } | 
		ForEach-Object { $_.value = [string]$scaleUnitId }

	$xml.Save($ConfigFilePath)
}

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



