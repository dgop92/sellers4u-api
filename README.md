# Sellers4U API

O2O (online to offline) Marketplace for university students. Some students create businesses and publish products or services. On the other hand, students that are interested in those products contact the business to manage the purchase

## Project environments

Development

- Data is preserved when restarting the server
- External services are not mocked but are created in a development environment
- Run with: `npm run dev`

Test

- Data is deleted when restarting the server
- External services are mocked
- There are utility endpoints for data deletion or creation (clear db, create users...)
- Run with: `npm run test-server`

Production

- Same as development, but external services in production

## Architecture

The following project follows a variant of the clean architecture. It organize features
using vertical slicing

## Infrastructure

### Main libraries

- TypeORM
- NestJS
- Joi

### External services

- Cloudinary as image storage service
- Firebase authentication to manage auth users

## Env vars

Before running the project, create the necessary and env files located in `env-vars` folder

## Requirements

- Nodejs 14 o greater
- PostgreSQL 11 or greater
