export const schemaSource = /* GraphQL */ `
  type Query {
    health: Health!
    hello(name: String): Hello!
  }

  type Health {
    ok: Boolean!
    service: String!
    runtime: String!
  }

  type Hello {
    message: String!
  }
`;
