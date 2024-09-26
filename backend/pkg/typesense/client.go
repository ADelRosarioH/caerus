package typesense

import (
	"os"

	"github.com/typesense/typesense-go/typesense"
)

func NewClient() (*typesense.Client, error) {
	client := typesense.NewClient(
		typesense.WithServer(os.Getenv("TYPESENSE_HOST")),
		typesense.WithAPIKey(os.Getenv("TYPESENSE_API_KEY")),
	)

	// Test the connection
	// _, err := client.Health(api.WithHealthOptions(""))
	// if err != nil {
	// 	return nil, err
	// }

	return client, nil
}
