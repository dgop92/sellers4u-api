import { ApplicationError, ErrorCode, InvalidInputError } from "@common/errors";
import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { AppUser } from "@features/auth/entities/app-user";
import { myAppUserFactory } from "@features/auth/factories/app-user.factory";
import { IAppUserRepository } from "@features/auth/ports/app-user.repository.definition";
import { Business } from "@features/business/entities/business";
import { myBusinessFactory } from "@features/business/factories/business.factory";
import { IBusinessRepository } from "@features/business/ports/business.repository.definition";
import { IBusinessUseCase } from "@features/business/ports/business.use-case.definition";
import { BusinessUseCase } from "@features/business/use-cases/business.use-case";
import { TestDBHelper } from "test/test-db-helper";
import { TEST_APP_USERS, TEST_BUSINESS } from "../mocks/test-data";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

// Note userId is mock in order to not use firebase

describe("business use-case", () => {
  let businessRepository: IBusinessRepository;
  let businessUseCase: IBusinessUseCase;
  let appUserRepository: IAppUserRepository;
  let appUser1: AppUser;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    const ds = TestDBHelper.instance.datasource;

    const appUserFactory = myAppUserFactory(ds);
    const businessFactory = myBusinessFactory(ds);

    appUserRepository = appUserFactory.appUserRepository;
    businessRepository = businessFactory.businessRepository;
    businessUseCase = businessFactory.businessUseCase;
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
      const business = await businessUseCase.create(
        { data: inputData },
        appUser1
      );
      expect(business).toMatchObject(inputData);

      const businessRetrieved = await businessRepository.getOneBy({
        searchBy: { id: business.id },
      });
      expect(businessRetrieved).toBeDefined();
    });
    it("should throw an error if app-user has already a business", async () => {
      await businessUseCase.create({ data: TEST_BUSINESS.business1 }, appUser1);
      try {
        await businessUseCase.create(
          { data: TEST_BUSINESS.business1 },
          appUser1
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.DUPLICATED_RECORD);
        }
      }
    });
  });

  describe("Update", () => {
    let business1: Business;
    let appUser2: AppUser;

    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
      appUser2 = await appUserRepository.create(TEST_APP_USERS.appUserTest2);
      business1 = await businessRepository.create(
        TEST_BUSINESS.business1,
        appUser1
      );
    });

    it("should update a business", async () => {
      const inputData = {
        name: "test business updated",
      };
      const business = await businessUseCase.update(
        { data: inputData },
        appUser1
      );
      const businessRetrieved = await businessRepository.getOneBy({
        searchBy: { id: business.id },
      });
      expect(businessRetrieved).toMatchObject({
        ...inputData,
        id: business.id,
      });
    });
    it("should throw an error if user has not business", async () => {
      try {
        await businessUseCase.update(
          { data: { name: "test business updated" } },
          appUser2
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
  });

  describe("Delete", () => {
    let business1: Business;
    let appUser2: AppUser;

    beforeEach(async () => {
      await TestDBHelper.instance.clear();
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
      appUser2 = await appUserRepository.create(TEST_APP_USERS.appUserTest2);
      business1 = await businessRepository.create(
        TEST_BUSINESS.business1,
        appUser1
      );
    });

    it("should delete a business", async () => {
      await businessUseCase.delete(appUser1);
      const businessRetrieved = await businessRepository.getOneBy({
        searchBy: { id: business1.id },
      });
      expect(businessRetrieved).toBeUndefined();
    });
    it("should throw an error if user has not business", async () => {
      try {
        await businessUseCase.delete(appUser2);
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
  });

  describe("Get one by", () => {
    let business1: Business;
    let appUser2: AppUser;

    beforeAll(async () => {
      await TestDBHelper.instance.clear();
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
      appUser2 = await appUserRepository.create(TEST_APP_USERS.appUserTest2);
      business1 = await businessRepository.create(
        TEST_BUSINESS.business1,
        appUser1
      );
    });

    it("should get a business by id", async () => {
      const businessRetrieved = await businessUseCase.getOneBy({
        searchBy: { id: business1.id },
      });
      expect(businessRetrieved).toBeDefined();
    });
    it("should get a business by id and load owner", async () => {
      const businessRetrieved = await businessUseCase.getOneBy({
        searchBy: { id: business1.id },
        options: { fetchOwner: true },
      });
      expect(businessRetrieved).toBeDefined();
      expect(businessRetrieved?.owner).toBeDefined();
      expect(businessRetrieved?.owner?.id).toBe(appUser1.id);
    });
    it("should get a business by name", async () => {
      const businessRetrieved = await businessUseCase.getOneBy({
        searchBy: { name: business1.name },
      });
      expect(businessRetrieved).toBeDefined();
    });
    it("should get a business by app user id", async () => {
      const businessRetrieved = await businessUseCase.getOneBy({
        searchBy: { appUserId: appUser1.id },
      });
      expect(businessRetrieved).toBeDefined();
    });
    it("should not get a business by id", async () => {
      const businessRetrieved = await businessUseCase.getOneBy({
        searchBy: { id: 123 },
      });
      expect(businessRetrieved).toBeUndefined();
    });
    it("should not get a business by name", async () => {
      const businessRetrieved = await businessUseCase.getOneBy({
        searchBy: { name: "asdasdnmaueygasd" },
      });
      expect(businessRetrieved).toBeUndefined();
    });
    it("should not get a business by app user id", async () => {
      const businessRetrieved = await businessUseCase.getOneBy({
        searchBy: { appUserId: 12836 },
      });
      expect(businessRetrieved).toBeUndefined();
    });
    it("should get business of app user", async () => {
      const businessRetrieved = await businessUseCase.getAppUserBusiness(
        appUser1
      );
      expect(businessRetrieved).toBeDefined();
      expect(businessRetrieved?.id).toBe(business1.id);
    });
    it("should not get business of app user", async () => {
      const businessRetrieved = await businessUseCase.getAppUserBusiness(
        appUser2
      );
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
      const businessesRetrieved = await businessUseCase.getManyBy({});
      expect(businessesRetrieved.count).toBe(3);
      expect(businessesRetrieved.results).toHaveLength(3);
    });
    it("should get all businesses with name bus", async () => {
      const businessesRetrieved = await businessUseCase.getManyBy({
        searchBy: { name: "bus" },
      });
      expect(businessesRetrieved.count).toBe(2);
      expect(businessesRetrieved.results).toHaveLength(2);
    });
  });
});

describe("business use-case invalid input", () => {
  let businessUseCase: BusinessUseCase;

  beforeAll(async () => {
    businessUseCase = new BusinessUseCase(undefined!);
  });

  describe("Create Invalid Input", () => {
    it("should throw an error if name has more than 100 characters", async () => {
      try {
        await businessUseCase.create(
          {
            data: { name: Array(130).join("x") },
          },
          undefined!
        );
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("name");
        }
      }
    });

    it("should throw an error if name has less than 5 characters", async () => {
      try {
        await businessUseCase.create(
          { data: { name: Array(4).join("x") } },
          undefined!
        );
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("name");
        }
      }
    });
  });

  describe("Update Invalid Input", () => {
    it("should throw an error if name has more than 100 characters", async () => {
      try {
        await businessUseCase.update(
          {
            data: { name: Array(130).join("x") },
          },
          undefined!
        );
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("name");
        }
      }
    });

    it("should throw an error if name has less than 5 characters", async () => {
      try {
        await businessUseCase.update(
          { data: { name: Array(4).join("x") } },
          undefined!
        );
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("name");
        }
      }
    });
  });
});
