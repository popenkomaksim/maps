#!/bin/bash
for f in $(find ./tiles-dest -type f); do 
    if [ ! -z "$(magick identify -regard-warnings $f 2>&1 > /dev/null)" ]; then 
        size=$(wc -c <"$f")
        is404=$(grep -c 'Error 404 (Not Found)' $f)
        if [ $size -eq 0 ]; then
            echo "$f is empty"
        fi
        if [ $is404 -eq 0 ] && [ $size -gt 0 ]; then 
            rm $f
            echo "removing $f"; 
        fi
    fi
done