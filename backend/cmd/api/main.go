package main

import (
	"log"
	"os"

	"github.com/adelrosarioh/caerus/internal/auth"
	"github.com/adelrosarioh/caerus/internal/middleware"
	"github.com/adelrosarioh/caerus/pkg/database"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/healthcheck"
)

func main() {
	// if err := godotenv.Load(); err != nil {
	// 	log.Println("No .env file found")
	// }

	app := fiber.New()

	// Initialize auth service
	authService, err := auth.NewAuthService()
	if err != nil {
		log.Fatalf("Failed to initialize auth service: %v", err)
	}

	// Provide a minimal config
	app.Use(healthcheck.New())

	// Initialize auth middleware
	authMiddleware := middleware.NewAuthMiddleware(authService)

	// Initialize database
	if err := database.InitDatabase(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize Typesense client
	// typesenseClient, err := typesense.NewClient()
	// if err != nil {
	// 	log.Fatalf("Failed to initialize Typesense client: %v", err)
	// }

	// Setup routes
	api := app.Group("/api")
	api.Use(authMiddleware.Authenticate())

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
