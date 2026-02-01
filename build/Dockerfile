# Use multi-stage builds
FROM golang:1.24.4-alpine
ENV GO111MODULE=auto
COPY ./backend /go/src/app
WORKDIR /go/src/app

# Install build dependencies for CGO
RUN apk add --no-cache build-base
# RUN apt-get update && apt-get install -y build-essential

# Build with vendor and CGO
# CGO_ENABLED=1 is required for go-sqlite3
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -mod=vendor  ./cmd/app/main.go

# Final stage
FROM m.daocloud.io/docker.io/library/alpine:3.17.10
# Install runtime dependencies
RUN apk add -U tzdata ca-certificates
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime
COPY --from=0 /go/src/app/main /go/bin/main

CMD ["/go/bin/main"]