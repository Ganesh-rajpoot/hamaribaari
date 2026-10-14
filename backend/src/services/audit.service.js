const prisma = require('../config/prisma');

const log = async ({ actorId, hospitalId, action, entity, entityId, metadata, ip }) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId || null,
        hospitalId: hospitalId || null,
        action,
        entity,
        entityId: entityId || null,
        metadata: metadata || undefined,
        ip: ip || null,
      },
    });
  } catch (e) {
    // Never let audit failure break the main flow — just log it.
    // eslint-disable-next-line no-console
    console.error('[audit] failed to write', e);
  }
};

module.exports = { log };