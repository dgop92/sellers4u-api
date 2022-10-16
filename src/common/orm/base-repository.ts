import { DataSource, EntityManager } from "typeorm";

export class BaseRepository {
  constructor(private dataSource: DataSource) {}

  async transaction(
    transaction: (manager: EntityManager) => Promise<void>
  ): Promise<void> {
    return this.dataSource.transaction(async (entityManager) => {
      await transaction(entityManager);
    });
  }
}
