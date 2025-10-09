#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PORT=3000

echo ""
echo "🚀 Starting Blog API..."
echo ""

# Check if port is in use
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $PORT is already in use${NC}"
    
    # Get the PID
    PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
    
    if [ ! -z "$PID" ]; then
        echo -e "${YELLOW}🔪 Killing process $PID on port $PORT...${NC}"
        kill -9 $PID 2>/dev/null
        
        # Wait a moment for the port to be released
        sleep 2
        
        # Verify it's killed
        if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${RED}❌ Failed to kill process on port $PORT${NC}"
            echo -e "${RED}   Please manually run: lsof -ti:$PORT | xargs kill -9${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ Port $PORT is now free${NC}"
        fi
    fi
else
    echo -e "${GREEN}✅ Port $PORT is available${NC}"
fi

echo ""
echo "🔧 Starting NestJS in development mode..."
echo ""

# Load environment variables from .env
if [ -f .env ]; then
    echo "📋 Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start the NestJS application
nest start --watch

