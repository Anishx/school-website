"use server";

import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
import { handleServerFunctions } from "@payloadcms/next/layouts";
import { importMap } from "./importMap";

export const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};
