package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func Auth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Continue to the next middleware/handler
		return c.Next()
	}
}

func Cors() fiber.Handler {
	return cors.New()
}
