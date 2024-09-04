#!/bin/bash
imagecontent=("soy-monolith-db" "back")
imagename=("icws24submission/postgres_monolith" "icws24submission/back_monolith" )


for i in "${!imagecontent[@]}"; do
     docker build -t "${imagename[$i]}" "${imagecontent[$i]}" 
done

