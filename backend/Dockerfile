FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY build/libs/jatuli-quiz-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]