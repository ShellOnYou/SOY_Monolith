#!/bin/bash
imagecontent=("soy-monolith-db" "back")
imagename=("icws24/postgres_monolith" "icws24/back_monolith" )


for i in "${!imagecontent[@]}"; do
     docker build -t "${imagename[$i]}" "${imagecontent[$i]}" 
done

