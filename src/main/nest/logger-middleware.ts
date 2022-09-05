import morgan from "morgan";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { AppLogger } from "@common/logger";

// TODO see performance impact of this middleware
// reason: creating a new function for each request

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: any) {
    return morgan("dev", {
      stream: {
        write: (message: string) => {
          AppLogger.getAppLogger().getLogger().http(message.trim());
        },
      },
    })(req, res, next);
  }
}
