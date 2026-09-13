/**
 * @class TimeUtils
 * @category Utility Classes
 * @summary Static utility methods for time formatting and validation
 * @constructor
 * @features
 * Time value validation
 * Minutes and seconds formatting
 * Milliseconds to seconds display
 * @description
 * Provides static helper methods for validating time values and formatting them
 * into human-readable strings for display in the game UI.
 * @example
 * // Modding usage example
 * TimeUtils.isValidTime(42.5);          // true
 * TimeUtils.formatTime(125);            // "2:05"
 * TimeUtils.formatSeconds(3500);        // "3.50s"
 * TimeUtils.formatTime(NaN);            // "--:--"
 */
class TimeUtils {
  /**
   * Checks whether a time value is a valid finite number.
   * @param {number} time - The value to validate
   * @returns {boolean} True if the value is a valid finite number
   */
  static isValidTime(time) {
    return typeof time != undefined && typeof time != null && !isNaN(time) && time != Infinity;
  }
  /**
   * Formats a time value in seconds to a minutes:seconds display string.
   * @param {number} time - Time in seconds
   * @returns {string} Formatted time string like "2:05" or "--:--" if invalid
   */
  static formatTime(time) {
    if (!TimeUtils.isValidTime(time)) return "--:--";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  /**
   * Formats a millisecond value to a seconds display with two decimal places.
   * @param {number} time - Time in milliseconds
   * @returns {string} Formatted string like "3.50s" or "0.00s" if invalid
   */
  static formatSeconds(time) {
    if (!TimeUtils.isValidTime(time)) return "0.00s";
    
    const seconds = time / 1000 % 60;
    return `${seconds.toFixed(2)}s`;
  }
}
