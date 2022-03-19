#!/bin/bash
function checkFile {
    if [ ! -z "$(identify -regard-warnings $1 2>&1 > /dev/null)" ]; then 
        is404=$(grep -c 'Error 404 (Not Found)' $1)
        if [ $is404 -eq 0 ]; then 
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
    for f in $(find $1 -type f); do
        if test "$(jobs | wc -l)" -ge 64; then
            wait
        fi
        ((nfiles+=1))
        echo -ne "$nfiles%\033[0K\r"
        checkFile $f &
    done
}
if ! command -v identify &> /dev/null
then
    echo "imagemagick is not installed"
    exit
fi
dest="./tiles-dest"
if [ "$1" ]; then
    dest=$1
fi
main $dest &
wait
