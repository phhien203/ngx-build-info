import { BuilderContext, createBuilder } from "@angular-devkit/architect";
import { getSystemPath, JsonObject, normalize } from "@angular-devkit/core";
import { readFileSync, writeFileSync } from "fs";

export interface BuildInfoOptions extends JsonObject {
  patchedFile: string;
  target2run?: string;
}

export default createBuilder(
  async (options: BuildInfoOptions, ctx: BuilderContext) => {
    ctx.logger.info("Patching has been started...");

    try {
      const fileToPatch = `${getSystemPath(normalize(ctx.workspaceRoot))}/${
        options.patchedFile
      }`;
      const packageJsonContent = readFileSync(
        `${getSystemPath(normalize(ctx.workspaceRoot))}/package.json`,
        "utf-8"
      );

      writeFileSync(
        fileToPatch,
        JSON.stringify(
          {
            version: JSON.parse(packageJsonContent).version,
            date: new Date().toISOString(),
          },
          null,
          2
        )
      );

      ctx.logger.info("Patching completed");

      if (!options.target2run) {
        return { success: true };
      }

      const target = await ctx.scheduleTarget({
        target: options.target2run,
        project: ctx.target.project,
        configuration: ctx.target.configuration,
      });
      const { success } = await target.result;

      return { success };
    } catch (error) {
      return { success: false };
    }
  }
);
