module.exports = async function log(type, message) {
  const colors = {
    SYSTEM: "\x1b[35m",
    ERROR: "\x1b[31m",
    INFO: "\x1b[36m",
    WARN: "\x1b[33m",
    RESET: "\x1b[0m",
  };

  console.log(`${colors[type] || colors.SYSTEM}[ ${type} ]${colors.RESET} ${message}`);
};
