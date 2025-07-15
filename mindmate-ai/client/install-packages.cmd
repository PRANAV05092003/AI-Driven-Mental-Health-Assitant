@echo off
echo Installing core dependencies...
call npm install react@18.2.0 react-dom@18.2.0
call npm install react-scripts@5.0.1

echo Installing UI libraries...
call npm install @headlessui/react@1.7.14 @heroicons/react@2.0.18
call npm install framer-motion@10.12.18
call npm install react-router-dom@6.15.0

echo Installing charting libraries...
call npm install apexcharts@3.41.0
call npm install react-apexcharts@1.3.9
call npm install chart.js@4.4.0 react-chartjs-2@5.2.0
call npm install recharts@2.7.3

echo Installing form and state management...
call npm install react-hook-form@7.45.3
call npm install react-query@3.39.3

echo Installing utility libraries...
call npm install axios@1.4.0
echo npm install date-fns@2.30.0
echo npm install jwt-decode@4.0.0
echo npm install react-hot-toast@2.4.1
echo npm install react-icons@4.10.1
echo npm install react-markdown@8.0.7
echo npm install react-speech-recognition@3.10.0
echo npm install react-syntax-highlighter@15.5.0

echo Installing development dependencies...
call npm install --save-dev @types/node@16.18.37 @types/react@18.2.15 @types/react-dom@18.2.7
call npm install --save-dev @testing-library/jest-dom@5.17.0 @testing-library/react@13.4.0 @testing-library/user-event@13.5.0
call npm install --save-dev @types/jest@27.5.2

echo Installation complete!
pause
