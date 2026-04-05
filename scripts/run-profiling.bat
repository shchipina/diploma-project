@echo off

echo.
echo ========================================
echo  SkillShare Performance Profiling Suite
echo ========================================
echo.

set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set RESULTS_DIR=profiling-results\%TIMESTAMP%
mkdir "%RESULTS_DIR%" 2>nul

echo Results will be saved to: %RESULTS_DIR%
echo.

curl -s http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Backend is not running on port 3000
    echo         Please start the backend first: cd backend ^&^& npm run start:prod
    exit /b 1
)

echo [OK] Backend is running
echo.

echo [1/8] Seeding database with test users...
cd backend
call npm run db:seed
cd ..
echo [OK] Database seeded
echo.

echo [2/8] Running CPU profiling (Clinic Flame)...
echo       This will take ~40 seconds...
cd backend
call npm run profile:flame
move .clinic "%RESULTS_DIR%\clinic-flame" >nul
cd ..
echo [OK] CPU profiling completed
echo.

echo [3/8] Running memory profiling (Clinic Heapprofiler)...
echo       This will take ~40 seconds...
cd backend
call npm run profile:heap
move .clinic "%RESULTS_DIR%\clinic-heap" >nul
cd ..
echo [OK] Memory profiling completed
echo.

echo [4/8] Running load test (Small: 10 users, 10s)...
cd backend
call npm run test:load:small > "..\%RESULTS_DIR%\load-test-small.txt"
cd ..
echo [OK] Small load test completed
echo.

echo [5/8] Running load test (Medium: 100 users, 30s)...
cd backend
call npm run test:load:medium > "..\%RESULTS_DIR%\load-test-medium.txt"
cd ..
echo [OK] Medium load test completed
echo.

echo [6/7] Running Artillery load testing...
cd backend
call npm run artillery:small > "..\%RESULTS_DIR%\artillery-small.txt"
cd ..
echo [OK] Artillery test completed
echo.

echo [7/7] Running frontend bundle analysis...
cd frontend
call npm run build:analyze
copy dist\stats.html "..\%RESULTS_DIR%\bundle-stats.html" >nul
cd ..
echo [OK] Bundle analysis completed
echo.

echo.
echo ========================================
echo  Profiling Complete!
echo ========================================
echo.
echo Results saved to: %RESULTS_DIR%
echo.
echo Files created:
echo    - clinic-flame\     (CPU flame graph)
echo    - clinic-heap\      (Memory allocation)
echo    - load-test-small.txt
echo    - load-test-medium.txt
echo    - artillery-small.txt
echo    - bundle-stats.html (Bundle visualization)
echo.
echo Next steps:
echo    1. Open clinic-flame\*.html in browser for CPU analysis
echo    2. Open clinic-heap\*.html in browser for memory analysis
echo    3. Open bundle-stats.html for bundle analysis
echo    4. Review load test results in .txt files
echo    5. Update docs/performance.md with findings
echo.

pause
