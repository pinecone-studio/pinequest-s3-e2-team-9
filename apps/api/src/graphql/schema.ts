import { schemaDomainTypes } from "./schema-parts/domain-types";
import { schemaEnums } from "./schema-parts/enums";
import { schemaExamTypes } from "./schema-parts/exam-types";
import { schemaRootTypes } from "./schema-parts/root-types";

export const schemaSource = /* GraphQL */ `
  ${schemaEnums}
  ${schemaRootTypes}
  ${schemaDomainTypes}
  ${schemaExamTypes}
`;
