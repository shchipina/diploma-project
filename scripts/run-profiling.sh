set -e

echo "SkillShare Performance Profiling Suite"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

RESULTS_DIR="profiling-results/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$RESULTS_DIR"

echo -e "${YELLOW} Results will be saved to: ${RESULTS_DIR}${NC}"
echo ""

if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${RED} Backend is not running on port 3000${NC}"
    echo "   Please start the backend first: cd backend && npm run start:prod"
    exit 1
fi

echo -e "${GREEN} Backend is running${NC}"
echo ""

echo -e "${YELLOW} Seeding database with test users...${NC}"
cd backend
npm run db:seed
cd ..
echo -e "${GREEN} Database seeded${NC}"
echo ""

echo -e "${YELLOW} Running CPU profiling (Clinic Flame)...${NC}"
echo "   This will take ~40 seconds..."
cd backend
npm run profile:flame
mv .clinic "$RESULTS_DIR/clinic-flame"
cd ..
echo -e "${GREEN} CPU profiling completed${NC}"
echo ""

echo -e "${YELLOW} Running memory profiling (Clinic Heapprofiler)...${NC}"
echo "   This will take ~40 seconds..."
cd backend
npm run profile:heap
mv .clinic "$RESULTS_DIR/clinic-heap"
cd ..
echo -e "${GREEN} Memory profiling completed${NC}"
echo ""

echo -e "${YELLOW}  Running load test (Small: 10 users, 10s)...${NC}"
cd backend
npm run test:load:small > "../$RESULTS_DIR/load-test-small.txt"
cd ..
echo -e "${GREEN} Small load test completed${NC}"
echo ""

echo -e "${YELLOW}  Running load test (Medium: 100 users, 30s)...${NC}"
cd backend
npm run test:load:medium > "../$RESULTS_DIR/load-test-medium.txt"
cd ..
echo -e "${GREEN} Medium load test completed${NC}"
echo ""

echo -e "${YELLOW}  Running Artillery load testing...${NC}"
cd backend
npm run artillery:small > "../$RESULTS_DIR/artillery-small.txt"
cd ..
echo -e "${GREEN} Artillery test completed${NC}"
echo ""

echo -e "${YELLOW}7️  Running frontend bundle analysis...${NC}"
cd frontend
npm run build:analyze
cp dist/stats.html "../$RESULTS_DIR/bundle-stats.html"
cd ..
echo -e "${GREEN} Bundle analysis completed${NC}"
echo ""

echo ""
echo "=========================================="
echo -e "${GREEN} Profiling Complete!${NC}"
echo "=========================================="
echo ""
echo "Results saved to: ${RESULTS_DIR}"
echo ""
echo "Files created:"
echo "   - clinic-flame/     (CPU flame graph)"
echo "   - clinic-heap/      (Memory allocation)"
echo "   - load-test-small.txt"
echo "   - load-test-medium.txt"
echo "   - artillery-small.txt"
echo "   - bundle-stats.html (Bundle visualization)"
echo ""
echo "Next steps:"
echo "   1. Open clinic-flame/*.html in browser for CPU analysis"
echo "   2. Open clinic-heap/*.html in browser for memory analysis"
echo "   3. Open bundle-stats.html for bundle analysis"
echo "   4. Review load test results in .txt files"
echo "   5. Update docs/performance.md with findings"
echo ""
