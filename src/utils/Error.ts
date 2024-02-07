//* to add status code in Error() we extends and create our own ErrorHandler(message, statusCode) */
class ErrorHandler extends Error {
 constructor(public message: string, public statusCode: number) {
  super(message);
  this.statusCode = statusCode;
 }
}

export default ErrorHandler
