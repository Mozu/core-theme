
function Get-Ext
{
	param($projectName , $force)
	if ( $projectName -eq $null )
	{
		$projectName = "Volusion.SiteBuilder.UX.Admin"
	}
	if ( $force -eq $null )
	{
		$force = $false
	}
	$p= get-project $projectName 
	$basePath=($p.Properties | Where-Object {$_.Name -eq "FullPath"} ).value
	$xml = [xml](Get-Content ($basePath+'web.config'))
	$extPath = $xml.SelectSingleNode("//add[@key='extPath']").value
	$extLP = $basePath + "\scripts\ext\"+ $extPath
	$extRP = "\\deviis03.adsdev.volusion.com\sbscripts\ext\"+ $extPath
	if( $force -or (!(test-path $extLP) -and (test-path $extRP))){ 
		robocopy $extRP $extLP
		robocopy ($extRP+ "\locale") ($extLP+"\locale") /e
		robocopy ($extRP+ "\resources") ($extLP+"\resources") /e
		robocopy ($extRP+ "\examples\ux") ($extLP+"\examples\ux") /e
	}
}

function Set-CopyToOutput 
{
	param($projectName)
	if ( $projectName -eq $null )
	{
		$projectName = "Volusion.SiteBuilder.UX.Themes"
	}
	$tProj =Get-Project $projectName
	SetCopyALlways $tProj

	
}

function SetCopyALlways( $item )
{
	
	ForEach ($subItem in $item.ProjectItems) 
	{
		SetCopyALlways $subItem
		ForEach ($prop in $subItem.Properties) 
		{
			if ( ($prop.name -eq "CopyToOutputDirectory") -and ($prop.value -lt 1))
			{
				write-host $subItem.Name  write-host $prop.value
				$prop.value =2
			}
		}
	}
		
}







function Sync-FSProject 
{
	param($projectName)
	if ( $projectName -eq $null )
	{
		$projectName = "Volusion.SiteBuilder.UX.Ria"
	}
	$tProj =Get-Project $projectName

	SyncFsWithProjectItem $tProj

	
}

function SyncFsWithProjectItem( $item )
{
	$badDirs = "docs" , "bin" , "obj" , "examples" , "welcome" , "ext"

	if ( $item.Kind -eq "{6bb5f8ee-4483-11d3-8bcf-00c04f8ec28c}" )
	{
		return 
	}
	if (  $badDirs -contains $item.name )
	{
		return
	}
	if ( $item.Kind -eq "{6bb5f8ef-4483-11d3-8bcf-00c04f8ec28c}" )
	{
		write-host $item.name
		$fname =  $item.FileNames(0)
		write-host $fname

	
		foreach( $subFile in Get-ChildItem  $fname )
		{
			$found = $false
			ForEach ($subItem in $item.ProjectItems) 
			{
				if( $subItem.Name -eq $subFile.Name ) 
				{
					$found = $true
					break
				}
		
			}
			if ( ($found -eq $false) -and !($badDirs -contains $subFile.name) )
			{

				if ( $subFile.PSIsContainer )
				{	
					write-host "AddFromDirectory" + $subFile.FullName
					$item.Collection.AddFromDirectory( $subFile.FullName )
				}
				else
				{
					write-host "AddFromFile" + $subFile.FullName
					$item.Collection.AddFromFile( $subFile.FullName )
				}
			}
		}
	}
	ForEach ($subItem in $item.ProjectItems) 
	{
		SyncFsWithProjectItem( $subItem )
	}
	

}


Export-ModuleMember -function Sync-FSProject
Export-ModuleMember -function Set-CopyToOutput 
Export-ModuleMember -function Get-Ext