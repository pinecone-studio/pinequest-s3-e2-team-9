import type { CodegenConfig } from "@graphql-codegen/cli";
import { schemaSource } from "../api/src/graphql/schema";

const config: CodegenConfig = {
  schema: schemaSource,
  documents: ["src/**/*.graphql"],
  ignoreNoDocuments: false,
  generates: {
    "src/graphql/generated.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        reactApolloVersion: 3,
        apolloReactCommonImportFrom: "../lib/apollo-codegen",
        apolloReactHooksImportFrom: "../lib/apollo-codegen",
      },
    },
  },
};

export default config;
