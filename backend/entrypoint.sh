#!/bin/sh

echo "Waiting for database..."

sleep 5

echo "Running migrations..."

php artisan migrate --seed --force

echo "Caching config..."

php artisan config:cache
php artisan route:cache

echo "Starting Laravel server..."

php artisan serve --host=0.0.0.0 --port=$PORT