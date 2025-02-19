module.exports = async function log(type, message){
  const colors = {
    SYSTEM: "",
    ERROR: "\x1b[31m",
    INFO: "",
    WARM: "",
    RESET: "\x1b[0m",
  };
  console.log(`${colors[type] || colors.SYSTEM}[ ${type} ]${colors.RESET} ${message}`)
}
