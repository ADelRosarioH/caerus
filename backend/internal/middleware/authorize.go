package middleware

import (
	"github.com/adelrosarioh/caerus/internal/auth"
	"github.com/gofiber/fiber/v2"
	kratos "github.com/ory/kratos-client-go"
)

type AuthMiddleware struct {
	authService *auth.AuthService
}

func NewAuthMiddleware(authService *auth.AuthService) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
	}
}

func (m *AuthMiddleware) Authenticate() fiber.Handler {
	return func(c *fiber.Ctx) error {
		sessionCookie := c.Cookies("ory_kratos_session")
		if sessionCookie == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "No session found",
			})
		}

		session, err := m.authService.ValidateSession(sessionCookie)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid session",
			})
		}

		c.Locals("session", session)
		c.Locals("identity", session.Identity)
		return c.Next()
	}
}

func (m *AuthMiddleware) Authorize(namespace, relation string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		identity := c.Locals("identity").(*kratos.Identity)
		object := c.Path()

		allowed, err := m.authService.CheckPermission(namespace, object, relation, identity.Id)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to check permissions",
			})
		}

		if !allowed {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Access denied",
			})
		}

		return c.Next()
	}
}
