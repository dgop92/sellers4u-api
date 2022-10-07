import { DataSource, EntityTarget } from "typeorm";
import { TestDataSource } from "./test-datasource";

export class TestDBHelper {
  private static _instance: TestDBHelper;

  private constructor() {}

  public static get instance(): TestDBHelper {
    if (!this._instance) this._instance = new TestDBHelper();

    return this._instance;
  }

  public datasource!: DataSource;

  async setupTestDB() {
    console.log("setupTestDB");
    this.datasource = await TestDataSource.initialize();
  }

  async teardownTestDB() {
    console.log("teardownTestDB");
    await this.datasource.destroy();
  }

  async clear() {
    const entities = this.datasource.entityMetadatas;
    const entityNames = entities.map((entity) => ({
      name: entity.name,
      tableName: entity.tableName,
    }));

    for (const entityData of entityNames) {
      const repository = this.datasource.getRepository(entityData.name);
      await repository.query(
        `TRUNCATE ${entityData.tableName} RESTART IDENTITY CASCADE;`
      );
    }
  }

  async clearTable<Entity>(entityClass: EntityTarget<Entity>) {
    const entityMetadata = this.datasource.getMetadata(entityClass);
    const repository = this.datasource.getRepository(entityClass);
    await repository.query(
      `TRUNCATE ${entityMetadata.tableName} RESTART IDENTITY CASCADE;`
    );
  }

  // TODO, be aware of sql injection
  async rawClearTable(tableName: string) {
    await this.datasource.query(
      `TRUNCATE ${tableName} RESTART IDENTITY CASCADE;`
    );
  }
}
