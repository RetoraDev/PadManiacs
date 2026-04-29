class TimeUtils {
  static isValidTime(time) {
    return typeof time != undefined && typeof time != null && !isNaN(time) && time != Infinity;
  }
  static formatTime(time) {
    if (!TimeUtils.isValidTime(time)) return "--:--";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}
