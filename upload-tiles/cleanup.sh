#!/bin/bash
function scan {
    echo "scanning $1"
    for f in $(find $1 -type f); do 
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
}
trap 'killall' INT

killall() {
    trap '' INT TERM
    echo "**** Shutting down... ****"
    kill -TERM 0
    wait
    echo DONE
}
for d in $(ls ./tiles-dest); do
    scan "./tiles-dest/$d" &
done
wait