# CampusShare

CampusShare is a microservices-based campus community platform designed to help students connect, collaborate, and share resources within their college.

The project follows a scalable backend architecture using Spring Boot Microservices, Spring Cloud, Eureka Service Discovery, and API Gateway.

## Features

- User Authentication & Authorization
- Student Profiles
- Posts & Campus Feed
- Resource Sharing
- Notifications
- Chat System
- API Gateway
- Eureka Service Discovery
- Centralized Configuration (optional)
- JWT Authentication
- REST APIs

## Tech Stack

### Backend
- Java 17
- Spring Boot
- Spring Cloud
- Spring Security
- Spring Data JPA
- Hibernate
- Maven

### Database
- MySQL

### Microservices
- API Gateway
- Eureka Server
- Auth Service
- User Service
- Post Service
- Notification Service
- Chat Service

### Tools
- Git
- GitHub
- Postman
- IntelliJ IDEA / VS Code
- Docker (Planned)

## Project Structure

```
backend/
│
├── eureka-server
├── api-gateway
├── auth-service
├── user-service
├── post-service
├── notification-service
└── chat-service
```

## Architecture

```
Client
   │
   ▼
API Gateway
   │
   ├───────────────┐
   ▼               ▼
Auth Service    User Service
   │               │
   ▼               ▼
Post Service   Notification Service
        │
        ▼
    Chat Service

        ▲
        │
 Eureka Service Registry
```

## Getting Started

### Clone the repository

```bash
git clone https://github.com/<your-username>/CampusShare.git
```

### Run Eureka Server

```bash
cd backend/eureka-server
mvn spring-boot:run
```

### Run API Gateway

```bash
cd backend/api-gateway
mvn spring-boot:run
```

### Run Individual Services

```bash
cd backend/auth-service
mvn spring-boot:run
```

Repeat for the remaining services.

## Future Enhancements

- Docker
- Kubernetes
- Redis Caching
- RabbitMQ / Kafka
- CI/CD with GitHub Actions
- File Upload
- AI-powered Recommendations

## Contributing

Contributions are welcome. Feel free to fork the repository and submit a pull request.

## License

This project is for learning and educational purposes.
