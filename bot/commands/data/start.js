const UserService = require('../../../server/service/UserService');

module.exports = async function startCommand(msg, args) {
  try {
    await UserService.createFollower(msg);
  } catch (e) {
    console.log(e);
  }
};
