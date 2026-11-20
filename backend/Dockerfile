FROM eclipse-temurin:25-jdk-noble AS build
WORKDIR /workspace

COPY .mvn/ .mvn/
COPY --chmod=755 mvnw ./
COPY pom.xml ./
COPY src/ src/
RUN ./mvnw -B -ntp -DskipTests package

FROM eclipse-temurin:25-jre-noble
WORKDIR /app

COPY --from=build /workspace/target/*.jar osi.jar
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/osi.jar"]
