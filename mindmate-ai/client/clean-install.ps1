# Clean up previous installation
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Install core dependencies
Write-Host "Installing core dependencies..."
npm install react@18.2.0 react-dom@18.2.0
npm install react-scripts@5.0.1

# Install UI libraries
Write-Host "Installing UI libraries..."
npm install @headlessui/react@1.7.14 @heroicons/react@2.0.18
npm install framer-motion@10.12.18
npm install react-router-dom@6.15.0

# Install charting libraries with specific versions
Write-Host "Installing charting libraries..."
npm install apexcharts@3.41.0
npm install react-apexcharts@1.3.9
npm install chart.js@4.4.0 react-chartjs-2@5.2.0
npm install recharts@2.7.3

# Install form and state management
Write-Host "Installing form and state management..."
npm install react-hook-form@7.45.3
npm install react-query@3.39.3

# Install utility libraries
Write-Host "Installing utility libraries..."
npm install axios@1.4.0
date-fns@2.30.0
jwt-decode@4.0.0
react-hot-toast@2.4.1
react-icons@4.10.1
react-markdown@8.0.7
react-speech-recognition@3.10.0
react-syntax-highlighter@15.5.0

# Install development dependencies
Write-Host "Installing development dependencies..."
npm install --save-dev @types/node@16.18.37 @types/react@18.2.15 @types/react-dom@18.2.7
npm install --save-dev @testing-library/jest-dom@5.17.0 @testing-library/react@13.4.0 @testing-library/user-event@13.5.0
npm install --save-dev @types/jest@27.5.2

Write-Host "Installation complete!"
