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
	app := fiber.New()

	// Initialize auth service
	err := auth.Init()

	if err != nil {
		log.Fatalf("Failed to initialize auth service: %v", err)
	}

	// Provide a minimal config
	app.Use(healthcheck.New())

	// Initialize auth middleware
	app.Use(middleware.Cors())
	app.Use(middleware.Auth())

	// Register routes
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!!!!")
	})

	// Initialize database
	if err := database.InitDatabase(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
