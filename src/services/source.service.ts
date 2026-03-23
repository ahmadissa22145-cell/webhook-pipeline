import {
  getSourceById,
  getSourceByToken,
  listSources,
} from "../repositories/source.repository.js";

import { NotFoundError, BadRequestError } from "../errors/index.js";

// ================== READ ===================

export async function getSourceByIdService(id: string) {
  if (!id) {
    throw new BadRequestError("Source id is required");
  }

  const source = await getSourceById(id);

  if (!source) throw new NotFoundError(`Source with id '${id}' not found`);

  return source;
}

// ===========================================

export async function getSourceByTokenService(token: string) {
  if (!token) throw new BadRequestError("Source token is required");

  const source = await getSourceByToken(token);

  if (!source) {
    throw new NotFoundError(`Source with token '${token}' not found`);
  }

  return source;
}

// ===========================================

export async function listSourcesService() {
  return await listSources();
}
