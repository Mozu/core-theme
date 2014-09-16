
if not exist %~dp0..\..\lib\ext-4.2.2.1144 (
	echo "missing ExtJS, downloading from \\aus01cpfs102.corp.volusion.com\Departments_F\Product\Software\ExtJS\ext-4.2.2.1144"
	mkdir ..\..\lib
	xcopy \\aus01cpfs102.corp.volusion.com\Departments_F\Product\Software\ExtJS\ext-4.2.2.1144 ..\..\lib\ext-4.2.2.1144 /i /y /s
)

if exist .sencha\workspace (
    attrib -r build/*.* /S
	attrib -r bootstrap.js
	attrib -r bootstrap.json
	sencha app build -c
	sencha ant testing js
	cd ..\Tests
	admintests.bat
	cd ..\Scripts
) else (

	sencha --sdk %~dp0..\..\lib\ext-4.2.2.1144 generate workspace .

	attrib -r build/*.* /S
	attrib -r bootstrap.js
	attrib -r bootstrap.json
	sencha app build -c
	sencha ant testing js
	cd ..\Tests
	admintests.bat
	cd ..\Scripts
)