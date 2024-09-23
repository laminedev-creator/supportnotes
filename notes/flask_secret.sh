#!/bin/bash

# Ids from db
ids=$(psql -U qradar -d qradar -t -c 'SELECT id FROM installed_application_instance;')

# For each id
for id in $ids; do
    echo "Processing id: $id"
    # Get QRADAR_FLASK_SECRET_KEY
    flask_secret=$(/opt/qradar/support/recon connect $id env | grep QRADAR_FLASK_SECRET_KEY | cut -d '=' -f2)
    echo "Encrypting secret..."
    # Encrypt QRADAR_FLASK_SECRET_KEY using java -jar
    encrypted_secret=$(echo "$flask_secret" | java -jar /opt/qradar/jars/ibm-si-mks.jar encrypt_command_line)
    echo "Outputting to text file..."
    # Output to sql file
    echo "UPDATE installed_application_instance SET flask_secret = '$encrypted_secret' WHERE id = $id;" >> flaskCommands.sql