import { DataSource, EntityManager } from "typeorm";

export class BaseRepository {
  constructor(private dataSource: DataSource) {}

  async transaction<U>(
    transaction: (manager: EntityManager) => Promise<U>
  ): Promise<U> {
    return this.dataSource.transaction(async (entityManager) => {
      return await transaction(entityManager);
    });
  }
}
