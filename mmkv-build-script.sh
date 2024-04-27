#!/bin/bash

# Define the text snippet to be inserted
snippet="\n\
    packagingOptions {\n\
        pickFirst '**/libc++_shared.so'\n\
        pickFirst '**/libfbjni.so'\n\
    }\
    "

# Define the path to the build.gradle file
build_gradle_path="node_modules/react-native-mmkv-storage/android/build.gradle"

# Define the pattern to search for where to insert the snippet
pattern="android {"

# Insert the snippet into the build.gradle file
awk -v snippet="$snippet" -v pattern="$pattern" '
    $0 ~ pattern {
        print $0
        print snippet
        next
    }
    { print }
' "$build_gradle_path" > temp && mv temp "$build_gradle_path"
