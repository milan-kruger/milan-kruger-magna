FROM node:18.16.0-alpine3.18

# Create the folders that will be exposed as volumes
RUN mkdir -p /trafman
RUN mkdir -p /trafman/script
RUN mkdir -p /trafman/source

# Copy the build script into the image
COPY build.sh /trafman/script/
RUN chmod +x -R /trafman/script/build.sh

# Add Git to the image (for the version footer)
RUN apk add --no-cache git

# Set the build script as the entry point when running containers
WORKDIR /trafman
ENTRYPOINT ["./script/build.sh"]
# ENTRYPOINT ["sh", "-c", "sleep 10000"]
