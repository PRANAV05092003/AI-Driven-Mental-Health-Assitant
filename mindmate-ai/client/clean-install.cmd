@echo off
echo Cleaning up previous installation...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo Installing dependencies with specific versions...
call npm install --no-package-lock
call npm install apexcharts@3.41.0 --save-exact
call npm install react-apexcharts@1.3.9 --save-exact
call npm install ajv@6.12.6 --save-exact

echo Installation complete!
pause
