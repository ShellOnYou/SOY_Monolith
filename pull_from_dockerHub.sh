#! /bin/bash
IMAGES=(
    "icws24submission/back_monolith:latest"
    "icws24submission/postgres_monolith:latest"
)


pull() {
    IMAGE=$1
    echo "Pulling image $IMAGE"
    if ! docker pull $IMAGE ; then
        echo "Failed to pull image $IMAGE"
        return 1
    fi
    echo ""
}

for IMAGE in "${IMAGES[@]}"
do
    if ! pull $IMAGE ; then
        echo "Error: Failed to pull an image, exiting now."
        exit 1
    fi
done

echo "All images pulled successfully."
