#!/bin/bash
function checkFile {
    if [ ! -z "$(magick identify -regard-warnings $1 2>&1 > /dev/null)" ]; then 
        size=$(wc -c <"$1")
        is404=$(grep -c 'Error 404 (Not Found)' $1)
        if [ $size -eq 0 ]; then
            echo "$1 is empty"
        fi
        if [ $is404 -eq 0 ] && [ $size -gt 0 ]; then 
            rm $1
            echo "removing $1"; 
        fi
    fi
}

trap 'killall' INT

killall() {
    trap '' INT TERM
    echo "**** Shutting down... ****"
    kill -TERM 0
    wait
    echo DONE
}
function main {
    nfiles=0
    for d in $(ls ./tiles-dest); do
        for f in $(find "./tiles-dest/$d" -type f); do
            if test "$(jobs | wc -l)" -ge 64; then
                wait -n
            fi
            ((nfiles+=1))
            echo -ne "$nfiles%\033[0K\r"
            checkFile $f &
        done
    done
}
main &
wait
