import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { AppUser } from "@features/auth/entities/app-user";
import { myAppUserFactory } from "@features/auth/factories/app-user.factory";
import { AppUserRepository } from "@features/auth/infrastructure/orm/repositories/app-user.repository";
import { Business } from "@features/business/entities/business";
import { myBusinessFactory } from "@features/business/factories/business.factory";
import { BusinessRepository } from "@features/business/infrastructure/orm/repositories/business.repository";
import { TestDBHelper } from "test/test-db-helper";
import { TEST_APP_USERS, TEST_BUSINESS } from "../mocks/test-data";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

// Note userId is mock in order to not use firebase

describe("business repository", () => {
  let businessRepository: BusinessRepository;
  let appUserRepository: AppUserRepository;
  let appUser1: AppUser;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    const ds = TestDBHelper.instance.datasource;
    const appUserFactory = myAppUserFactory(ds);
    appUserRepository = appUserFactory.appUserRepository as AppUserRepository;
    const businessFactory = myBusinessFactory(ds);
    businessRepository =
      businessFactory.businessRepository as BusinessRepository;
  });

  afterAll(async () => {
    await TestDBHelper.instance.teardownTestDB();
  });

  describe("Create", () => {
    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
    });

    it("should create a business", async () => {
      const inputData = {
        name: "test business",
      };
      const business = await businessRepository.create(inputData, appUser1);
      expect(business).toMatchObject(inputData);

      const businessRetrieved = await businessRepository.getOneBy({
        searchBy: { id: business.id },
      });
      expect(businessRetrieved).toBeDefined();
    });
  });

  describe("Update", () => {
    let business1: Business;

    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
      business1 = await businessRepository.create(
        TEST_BUSINESS.business1,
        appUser1
      );
    });

    it("should update a business", async () => {
      const inputData = {
        name: "test business updated",
      };
      const business = await businessRepository.update(business1, inputData);
      const businessRetrieved = await businessRepository.getOneBy({
        searchBy: { id: business.id },
      });
      expect(businessRetrieved).toMatchObject({
        ...inputData,
        id: business.id,
      });
    });
  });

  describe("Delete", () => {
    let business1: Business;

    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
      business1 = await businessRepository.create(
        TEST_BUSINESS.business1,
        appUser1
      );
    });

    it("should delete a business", async () => {
      await businessRepository.delete(business1);
      const businessRetrieved = await businessRepository.getOneBy({
        searchBy: { id: business1.id },
      });
      expect(businessRetrieved).toBeUndefined();
    });
  });

  describe("Get one by", () => {
    let business1: Business;

    beforeAll(async () => {
      await TestDBHelper.instance.clear();
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
      business1 = await businessRepository.create(
        TEST_BUSINESS.business1,
        appUser1
      );
    });

    it("should get a business by id", async () => {
      const businessRetrieved = await businessRepository.getOneBy({
        searchBy: { id: business1.id },
      });
      expect(businessRetrieved).toBeDefined();
    });
    it("should get a business by id and load owner", async () => {
      const businessRetrieved = await businessRepository.getOneBy({
        searchBy: { id: business1.id },
        options: { fetchOwner: true },
      });
      expect(businessRetrieved).toBeDefined();
      expect(businessRetrieved?.owner).toBeDefined();
      expect(businessRetrieved?.owner?.id).toBe(appUser1.id);
    });
    it("should get a business by name", async () => {
      const businessRetrieved = await businessRepository.getOneBy({
        searchBy: { name: business1.name },
      });
      expect(businessRetrieved).toBeDefined();
    });
    it("should get a business by app user id", async () => {
      const businessRetrieved = await businessRepository.getOneBy({
        searchBy: { appUserId: appUser1.id },
      });
      expect(businessRetrieved).toBeDefined();
    });
    it("should not get a business by id", async () => {
      const businessRetrieved = await businessRepository.getOneBy({
        searchBy: { id: 123 },
      });
      expect(businessRetrieved).toBeUndefined();
    });
    it("should not get a business by name", async () => {
      const businessRetrieved = await businessRepository.getOneBy({
        searchBy: { name: "asdasdnmaueygasd" },
      });
      expect(businessRetrieved).toBeUndefined();
    });
    it("should not get a business by app user id", async () => {
      const businessRetrieved = await businessRepository.getOneBy({
        searchBy: { appUserId: 12836 },
      });
      expect(businessRetrieved).toBeUndefined();
    });
  });

  describe("Get many by", () => {
    let appUser2: AppUser;
    let appUser3: AppUser;

    beforeAll(async () => {
      await TestDBHelper.instance.clear();
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
      appUser2 = await appUserRepository.create(TEST_APP_USERS.appUserTest2);
      appUser3 = await appUserRepository.create(TEST_APP_USERS.appUserTest3);
      await Promise.all([
        businessRepository.create(TEST_BUSINESS.business1, appUser1),
        businessRepository.create(TEST_BUSINESS.business2, appUser2),
        businessRepository.create(TEST_BUSINESS.business3, appUser3),
      ]);
    });
    it("should get all businesses", async () => {
      const businessesRetrieved = await businessRepository.getManyBy({});
      expect(businessesRetrieved.count).toBe(3);
      expect(businessesRetrieved.results).toHaveLength(3);
    });
    it("should get all businesses loading its owners", async () => {
      const businessesRetrieved = await businessRepository.getManyBy({
        options: { fetchOwner: true },
      });
      const owners = businessesRetrieved.results.map((b) => b.owner);

      expect(businessesRetrieved.count).toBe(3);
      expect(businessesRetrieved.results).toHaveLength(3);
      expect(businessesRetrieved.results).toHaveLength(3);
      expect(owners.map((o) => o?.id).sort()).toEqual(
        [appUser1.id, appUser2.id, appUser3.id].sort()
      );
    });
    it("should get all businesses with name bus", async () => {
      const businessesRetrieved = await businessRepository.getManyBy({
        searchBy: { name: "bus" },
      });
      expect(businessesRetrieved.count).toBe(2);
      expect(businessesRetrieved.results).toHaveLength(2);
    });
    it("should get all businesses with pagination", async () => {
      const businessesRetrieved = await businessRepository.getManyBy({
        pagination: { limit: 1, skip: 1 },
      });
      expect(businessesRetrieved.count).toBe(1);
      expect(businessesRetrieved.results).toHaveLength(1);
    });
  });
});
