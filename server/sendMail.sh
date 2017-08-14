#!/bin/sh
name=$1
title=$2
file=$3
cat mail.html |mutt -s ${title} -e 'set content_type="text/html"' ${name} -a ${file}
