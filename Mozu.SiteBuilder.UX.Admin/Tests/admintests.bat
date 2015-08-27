cd ..\Scripts
sencha compile metadata -f -o ..\Tests\testtmp.json --json
cd ..\Tests
node makeadmintests.js .\testtmp.json
del testtmp.json