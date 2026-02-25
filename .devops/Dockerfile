# Use the official Nginx image as the base image
FROM nginx

# Copy the contents of the Angular build output folder into the Nginx default document root directory
COPY ./build /usr/share/nginx/html

# Copy the Nginx configuration file into the Docker image
# COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf

# Change ownership and permissions
RUN chown -R 1000:1000 /usr/share/nginx/html \
    && chmod -R 777 /usr/share/nginx/html

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]