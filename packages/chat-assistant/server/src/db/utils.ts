import { sql } from "kysely";

export function createConstraintCheckExpression(
  column: string,
  allowedValues: readonly string[],
) {
  return sql`${sql.ref(column)} in (${sql.join(
    allowedValues.map((value) => sql.lit(value)),
  )})`;
}
