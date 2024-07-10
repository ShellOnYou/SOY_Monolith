#!/bin/bash
imagecontent=("back" "soy-monolith-db")
imagename=("icws24submission/postgres_monolith" "icws24submission/back_monolith" )


for i in "${!imagecontent[@]}"; do
     docker build -t "${imagename[$i]}" "${imagecontent[$i]}" 
done

