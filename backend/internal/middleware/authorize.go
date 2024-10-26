package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/adaptor"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/supertokens/supertokens-golang/supertokens"
)

func Auth() fiber.Handler {
	// return func(c *fiber.Ctx) error {
	// 	// SuperTokens middleware
	// 	handler := fasthttpadaptor.NewFastHTTPHandler(
	// 		supertokens.Middleware(nil),
	// 	)

	// 	// Call the adapted handler
	// 	handler(c.Context())

	// 	log.Info("Auth middleware")

	// 	// If SuperTokens handled the request (e.g., refresh token rotation),
	// 	// we don't want to continue to the next handler
	// 	if c.Response().StatusCode() != fiber.StatusOK {
	// 		log.Info("Auth middleware: response status code not OK")
	// 		return nil
	// 	}

	// 	log.Info("Auth middleware: response status code OK")

	// 	// Continue to the next middleware/handler
	// 	return c.Next()
	// }
	return adaptor.HTTPMiddleware(supertokens.Middleware)
}

func Cors() fiber.Handler {
	return cors.New(cors.Config{
		AllowOrigins:     "http://localhost",
		AllowCredentials: true,
		AllowHeaders:     strings.Join(append([]string{"Content-Type"}, supertokens.GetAllCORSHeaders()...), ","),
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
	})
}
