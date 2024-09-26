package auth

import (
	"context"
	"os"

	keto "github.com/ory/keto-client-go"
	kratos "github.com/ory/kratos-client-go"
)

type AuthService struct {
	kratosClient    *kratos.APIClient
	ketoReadClient  *keto.APIClient
	ketoWriteClient *keto.APIClient
}

func NewAuthService() (*AuthService, error) {
	kratosConfig := kratos.NewConfiguration()
	kratosConfig.Servers = []kratos.ServerConfiguration{
		{
			URL: os.Getenv("KRATOS_PUBLIC_URL"),
		},
	}

	ketoReadConfig := keto.NewConfiguration()
	ketoReadConfig.Servers = []keto.ServerConfiguration{
		{
			URL: os.Getenv("KETO_READ_URL"),
		},
	}

	ketoWriteConfig := keto.NewConfiguration()
	ketoWriteConfig.Servers = []keto.ServerConfiguration{
		{
			URL: os.Getenv("KETO_WRITE_URL"),
		},
	}

	return &AuthService{
		kratosClient:    kratos.NewAPIClient(kratosConfig),
		ketoReadClient:  keto.NewAPIClient(ketoReadConfig),
		ketoWriteClient: keto.NewAPIClient(ketoWriteConfig),
	}, nil
}

func (s *AuthService) ValidateSession(sessionToken string) (*kratos.Session, error) {
	session, _, err := s.kratosClient.FrontendAPI.ToSession(context.Background()).Cookie(sessionToken).Execute()
	if err != nil {
		return nil, err
	}
	return session, nil
}

func (s *AuthService) CheckPermission(namespace, object, relation, subject string) (bool, error) {
	resp, _, err := s.ketoReadClient.PermissionApi.CheckPermission(context.Background()).
		Namespace(namespace).
		Object(object).
		Relation(relation).
		SubjectId(subject).
		Execute()
	if err != nil {
		return false, err
	}
	return resp.Allowed, nil
}
