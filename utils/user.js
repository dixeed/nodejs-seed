'use strict';

function isBanned(user) {
  if (!user.bans || user.bans.length === 0) {
    return false;
  }

  return user.bans.some(ban => {
    const currentDate = new Date();
    const creationDate = new Date(ban.createdAt);
    const endDate = new Date();
    endDate.setMinutes(creationDate.getMinutes() + ban.duration);

    return ban.duration === -1 || currentDate < endDate;
  });
}

module.exports = { isBanned };
