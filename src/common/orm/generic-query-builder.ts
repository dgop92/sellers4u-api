import { SelectQueryBuilder } from "typeorm";

export type SkipLimitPagination = {
  skip?: number;
  limit?: number;
};

export enum SearchType {
  EQUAL = "=",
  LIKE = "like",
}

export type ColumnOptions = {
  searchType?: SearchType;
  columnName?: string;
  onDecorateValue?: (value: string) => string;
};

export type WhereQuery = {
  conditions: string[];
  params: { [att: string]: any };
};

export class GenericSelectBuilder<T> {
  constructor(
    private query: SelectQueryBuilder<T>,
    private aliasName: string = "record"
  ) {}

  addLeftJoinsToQuery(relations: string[]) {
    relations.forEach((relationName) => {
      this.query.leftJoinAndSelect(
        `${this.aliasName}.${relationName}`,
        relationName
      );
    });

    return this;
  }

  addFilterToQuery(whereQueryData: WhereQuery) {
    if (whereQueryData.conditions.length > 0) {
      this.query.where(
        whereQueryData.conditions.join(" and "),
        whereQueryData.params
      );
    }

    return this;
  }

  addPaginationToQuery(pagination?: SkipLimitPagination, maxLimit = 500) {
    const limit = pagination?.limit || maxLimit;
    const offset = pagination?.skip || 0;

    this.query.limit(limit).offset(offset);

    return this;
  }

  getQuery() {
    return this.query;
  }

  getAliasName() {
    return this.aliasName;
  }
}

export function getRelationsFromRelationOptions(options?: {
  [key: string]: boolean | undefined;
}): string[] {
  const relations: string[] = [];
  if (options) {
    Object.keys(options).forEach((relationName) => {
      if (!!options[relationName]) {
        relations.push(relationName);
      }
    });
  }
  return relations;
}

export function getWhereQueryData(
  searchBy: { [key: string]: any } = {},
  columnOptions: { [key: string]: ColumnOptions | undefined } = {},
  aliasName: string = "record"
) {
  const whereQueryData: WhereQuery = { conditions: [], params: {} };

  Object.keys(searchBy).forEach((keyName) => {
    const value = searchBy[keyName];

    if (value !== undefined && value !== null) {
      const currentColumnOptions = columnOptions[keyName];
      const columnName = currentColumnOptions?.columnName || keyName;
      const searchType = currentColumnOptions?.searchType || SearchType.EQUAL;
      const condition = `${aliasName}.${columnName} ${searchType} :${columnName}`;
      whereQueryData.conditions.push(condition);
      const onDecorateValue = currentColumnOptions?.onDecorateValue;
      if (onDecorateValue) {
        whereQueryData.params[columnName] = onDecorateValue(value);
      } else {
        whereQueryData.params[columnName] = value;
      }
    }
  });

  return whereQueryData;
}
