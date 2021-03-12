
class Validation {
  static validationNumber(rule) {
    rule.push({
      type: "number",
      message: "必须填写数字",
      transform: value => {
        if (/^[0-9]+(?:\.[0-9]+)?$/.test(value) || !value) {
          return parseInt(value) || 0;
        }
        return false
      }
    });
  }
  static validationRequire(rule) {
    rule.push({
      message: "不能为空",
      required: true
    });
  }
  static validationRang(rule, className) {
    if (className.includes("min")) {
      let regex = /min\s*?=\s*(\d+)/;
      className.match(regex);
      let min = parseInt(RegExp.$1);
      rule.push({
        type: className.includes("number") ? "number" : "string",
        min: min,
        message: `不能小于${min}`
      });
    }
    if (className.includes("max")) {
      let regex = /max\s*?=\s*(\d+)/;
      className.match(regex);
      let max = parseInt(RegExp.$1);
      rule.push({
        type: className.includes("number") ? "number" : "string",
        max: max,
        message: `不能大于${max}`
      });
    }
  }
  init(validation) {
    let rule = [];
    let className = validation.replace(/\s+/g, "");
    if (className.includes("required")) {
      Validation.validationRequire(rule);
    }
    if (className.includes("number")) {
      Validation.validationNumber(rule);
    }
    if (className.includes("min") || className.includes("max")) {
      Validation.validationRang(rule, className);
    }
    return rule;
  }
}
export default new Validation();
