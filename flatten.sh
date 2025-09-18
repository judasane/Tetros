#!/bin/bash

# The name of the file to be generated
OUTPUT_FILE="flattened_output.txt"

# A comma-separated list of file extensions to exclude.
# Add or remove extensions as needed.
# Example: "log,lock,png,jpg"
EXCLUDE_EXTENSIONS="map,tsbuildinfo,log,lock,db,sqlite,sqlite3,dump,lcov,png,jpg,jpeg,gif,ico,zip,gz,pdf,mp4,svg"

# A comma-separated list of specific files to exclude.
# The script itself and the output file are always excluded.
EXCLUDE_FILES="package-lock.json,yarn.lock,pnpm-lock.yaml"

# Create or clear the output file
> "$OUTPUT_FILE"

# Convert comma-separated strings to regex patterns for grep
exclude_ext_pattern=$(echo "$EXCLUDE_EXTENSIONS" | sed 's/,/|/g')
# Add the script's own name to the files exclusion list
if [ -z "$EXCLUDE_FILES" ]; then
    exclude_files_pattern="flatten.sh"
else
    exclude_files_pattern="flatten.sh|$(echo "$EXCLUDE_FILES" | sed 's/,/|/g')"
fi


# Get the list of files from git, then filter them
git ls-files | \
grep -vE "\.($exclude_ext_pattern)$" | \
grep -vE "^($exclude_files_pattern)$" | \
while IFS= read -r file; do
    # Append a header and the file content to the output file
    echo "--- START OF FILE: $file ---" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo -e "\n--- END OF FILE: $file ---\n" >> "$OUTPUT_FILE"
done

echo "✅ Repository flattened into $OUTPUT_FILE"
