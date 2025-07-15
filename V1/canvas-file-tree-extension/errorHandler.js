/**
 * Error handling utilities for Canvas Download Plugin
 */
class ErrorHandler {
  static log(message, error = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] Canvas Parser: ${message}`;
    
    if (error) {
      console.error(logMessage, error);
    } else {
      console.warn(logMessage);
    }
  }
  
  static handleError(operation, error) {
    this.log(`Error in ${operation}`, error);
    return null;
  }
  
  static safeExecute(operation, fallback = null) {
    try {
      return operation();
    } catch (error) {
      this.log(`Safe execution failed`, error);
      return fallback;
    }
  }
  
  static async safeAsyncExecute(operation, fallback = null) {
    try {
      return await operation();
    } catch (error) {
      this.log(`Safe async execution failed`, error);
      return fallback;
    }
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ErrorHandler;
}