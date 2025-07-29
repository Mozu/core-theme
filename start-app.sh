#!/bin/sh

# Check if cgroup v2 memory limit file exists
MEMORY_LIMIT_FILE="/sys/fs/cgroup/memory.max"

echo "Checking for cgroup v2 memory limit at $MEMORY_LIMIT_FILE"

if [ -f "$MEMORY_LIMIT_FILE" ]; then
    # Read the memory limit value
    MEMORY_LIMIT=$(cat "$MEMORY_LIMIT_FILE")

    # Check if we got a valid number
    if [ ! -z "$MEMORY_LIMIT" ] && [ "$MEMORY_LIMIT" != "max" ]; then
        # Convert decimal to hexadecimal (without 0x prefix)
        MEMORY_LIMIT_HEX=$(printf "%x" $MEMORY_LIMIT)

        # Set the environment variable
        export COMPlus_GCHeapHardLimit=$MEMORY_LIMIT_HEX

        echo "Memory limit detected: $MEMORY_LIMIT bytes"
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