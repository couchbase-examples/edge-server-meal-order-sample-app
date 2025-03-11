#!/bin/sh

# Kill couchbase edge server

process_name="couchbase-edge-server"

# Find the PID of the process
pid=$(pgrep -f "$process_name")

# Check if the process is running
if [ -n "$pid" ]; then
  # Kill the process
  kill "$pid"
  echo "Process '$process_name' killed."
else
  echo "Process '$process_name' not running."
fi

sleep 1

# remove current database
db_name="american234.cblite2"
if [ -d $db_name ]; then
  rm -r $db_name
  echo "removed '$db_name'"
else
  echo "No '$db_name'"
fi

#copy original one
orig_db_name="american234-orig.cblite2"
cp -r $orig_db_name $db_name 

#restart edge server
./$process_name --verbose  config-tls-replication-sync.json

