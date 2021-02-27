<p align="center">
  <a href="https://github.com/TomaszTrebacz/nest-auth-graphql-redis/packages/541967"><img src="https://i.ibb.co/jvpVBKm/api-gateway.png" alt="Package Logo" />
  </a>
   <h1 align="center">API-GATEWAY | part of <a href="https://github.com/TomaszTrebacz/fox.CMS">fox.CMS</a> app</h1>
</p>

## Description

Api-gateway sits between a frontend and multiple backend services - the task of this microservice is to secure (Helmet, CORS, Rate limiting) and distribute incoming queries & mutations across the other two services using Apollo Federation.  
In this repository are also placed all e2e tests (queries & mutation).

## Installation

1. Create .env file following the example (example.env) in the repository.

```ts
APP_PORT=

USER_URL=
BLOG_URL=
```

2. Install dependencies

```
npm install
```

3. Make sure that <a href="https://github.com/TomaszTrebacz/fox.CMS-user-service">user-service</a> and <a href="https://github.com/TomaszTrebacz/fox.CMS-blog-service">blog-service</a> are listening.

4. Run the app:

```ts
npm run start:dev
```

## Testing

As I mentioned before, in api-gateway are placed all e2e tests which refer to other microservices. Please, read <a href="https://github.com/TomaszTrebacz/fox.CMS">README.MD in main repository</a> to learn how to test whole app.

The result:

<p align="center">
<img src="https://i.ibb.co/5kCDs5v/test.png" alt="Tests" />

</p>
