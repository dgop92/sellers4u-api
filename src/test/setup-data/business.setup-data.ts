import { AppLogger } from "@common/logging/logger";
import { myBusinessFactory } from "@features/business/factories/business.factory";
import { setupAuthModuleData } from "./auth.setup-data";

export const TEST_SERVER_BUSINESS = {
  business1: {
    name: "test business 1",
  },
  business2: {
    name: "test business 2",
  },
  business3: {
    name: "no common name 3",
  },
};

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

async function setupBusinessData() {
  const { businessUseCase } = myBusinessFactory();
  const { users } = await setupAuthModuleData();

  const user1 = users.find((u) => u.appUser.firstName === "John")!;
  const user2 = users.find((u) => u.appUser.firstName === "Juan")!;
  const user3 = users.find((u) => u.appUser.firstName === "Pedro")!;

  const sortedUsers = [user1, user2, user3];

  const promises = Object.values(TEST_SERVER_BUSINESS).map((b, index) =>
    businessUseCase.create(
      {
        data: b,
      },
      sortedUsers[index].appUser
    )
  );
  myLogger.info("setting up business data");
  const businesses = Promise.all(promises);
  myLogger.info("business data successfully setup");
  return businesses;
}

export async function setupBusinessModuleData() {
  const businesses = await setupBusinessData();
  return { businesses };
}
