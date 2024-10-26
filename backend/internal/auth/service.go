package auth

import (
	"github.com/gofiber/fiber/v2/log"
	"github.com/supertokens/supertokens-golang/recipe/dashboard"
	"github.com/supertokens/supertokens-golang/recipe/emailpassword"
	"github.com/supertokens/supertokens-golang/recipe/session"
	"github.com/supertokens/supertokens-golang/supertokens"
)

func Init() error {
	// Initialize SuperTokens
	apiBasePath := "/api/auth"
	websiteBasePath := "/auth"
	err := supertokens.Init(supertokens.TypeInput{
		Supertokens: &supertokens.ConnectionInfo{
			ConnectionURI: "http://localhost:3567",
		},
		AppInfo: supertokens.AppInfo{
			AppName:         "Caerus",
			APIDomain:       "http://localhost",
			WebsiteDomain:   "http://localhost",
			APIBasePath:     &apiBasePath,
			WebsiteBasePath: &websiteBasePath,
		},
		RecipeList: []supertokens.Recipe{
			emailpassword.Init(nil),
			session.Init(nil),
			dashboard.Init(nil),
		},
	})

	if err != nil {
		return err
	}

	log.Info("SuperTokens initialized")

	return nil
}

// func ValidateSession(sessionToken string) (*kratos.Session, error) {
// 	session, _, err := s.kratosClient.FrontendAPI.ToSession(context.Background()).Cookie(sessionToken).Execute()
// 	if err != nil {
// 		return nil, err
// 	}
// 	return session, nil
// }

// func (s *AuthService) CheckPermission(namespace, object, relation, subject string) (bool, error) {
// 	resp, _, err := s.ketoReadClient.PermissionApi.CheckPermission(context.Background()).
// 		Namespace(namespace).
// 		Object(object).
// 		Relation(relation).
// 		SubjectId(subject).
// 		Execute()
// 	if err != nil {
// 		return false, err
// 	}
// 	return resp.Allowed, nil
// }
