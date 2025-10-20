#!/bin/sh

# Check if cgroup v2 memory limit file exists
MEMORY_LIMIT_FILE="/sys/fs/cgroup/memory.max"

echo "Checking for cgroup v2 memory limit at $MEMORY_LIMIT_FILE"

if [ -f "$MEMORY_LIMIT_FILE" ]; then
    # Read the memory limit value
    MEMORY_LIMIT=$(cat "$MEMORY_LIMIT_FILE")

    # Check if we got a valid number
    if [ ! -z "$MEMORY_LIMIT" ] && [ "$MEMORY_LIMIT" != "max" ]; then
        echo "Memory limit detected: $MEMORY_LIMIT bytes"
        
        # Calculate memory to reserve for Node.js
        NODE_MEMORY_BYTES=0
        
        # Check if NODE_MAX_MEMORY_MB is set (takes precedence)
        if [ ! -z "$KIBO__ENV__SITEBUILDER__NODE_MAX_MEMORY_MB" ]; then
            echo "NODE_MAX_MEMORY_MB is set to: $KIBO__ENV__SITEBUILDER__NODE_MAX_MEMORY_MB MB"
            
            # Convert MB to bytes
            NODE_MEMORY_BYTES=$((KIBO__ENV__SITEBUILDER__NODE_MAX_MEMORY_MB * 1024 * 1024))
            
            # Calculate 70% of total memory for validation
            SEVENTY_PERCENT=$(($MEMORY_LIMIT * 70 / 100))
            
            if [ $NODE_MEMORY_BYTES -ge $SEVENTY_PERCENT ]; then
                echo "ERROR: NODE_MAX_MEMORY_MB ($KIBO__ENV__SITEBUILDER__NODE_MAX_MEMORY_MB MB = $NODE_MEMORY_BYTES bytes) exceeds 70% of total memory ($SEVENTY_PERCENT bytes). Ignoring NODE_MAX_MEMORY_MB."
                NODE_MEMORY_BYTES=0
            else
                echo "Reserving $NODE_MEMORY_BYTES bytes for Node.js"
            fi
        # Check if NODE_PERCENT is set
        elif [ ! -z "$KIBO__ENV__SITEBUILDER__NODE_PERCENT" ]; then
            echo "NODE_PERCENT is set to: $KIBO__ENV__SITEBUILDER__NODE_PERCENT%"
            
            # Validate percentage is between 1 and 99
            if [ $KIBO__ENV__SITEBUILDER__NODE_PERCENT -lt 1 ] || [ $KIBO__ENV__SITEBUILDER__NODE_PERCENT -gt 99 ]; then
                echo "ERROR: NODE_PERCENT must be between 1 and 99. Ignoring NODE_PERCENT."
            else
                # Calculate percentage of total memory to reserve for Node
                NODE_MEMORY_BYTES=$(($MEMORY_LIMIT * $KIBO__ENV__SITEBUILDER__NODE_PERCENT / 100))
                echo "Reserving $NODE_MEMORY_BYTES bytes ($KIBO__ENV__SITEBUILDER__NODE_PERCENT%) for Node.js"
            fi
        fi
        
        # Calculate .NET memory limit (total - node reservation)
        DOTNET_MEMORY_LIMIT=$(($MEMORY_LIMIT - $NODE_MEMORY_BYTES))
        
        # Convert to hexadecimal (without 0x prefix)
        MEMORY_LIMIT_HEX=$(printf "%x" $DOTNET_MEMORY_LIMIT)

        # Set the environment variable
        export COMPlus_GCHeapHardLimit=$MEMORY_LIMIT_HEX

        echo "Setting .NET heap limit to: $DOTNET_MEMORY_LIMIT bytes"
        echo "Set COMPlus_GCHeapHardLimit=$MEMORY_LIMIT_HEX"
    else
        echo "Memory limit file exists but contains invalid or unlimited value: '$MEMORY_LIMIT'"
    fi
else
    echo "No cgroup v2 memory limit file found at $MEMORY_LIMIT_FILE"
fi

# Start the application
echo "Starting application..."
exec dotnet Mozu.SiteBuilder.UX.dll