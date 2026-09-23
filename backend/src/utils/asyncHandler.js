// Envolve handlers para encaminhar exceções (síncronas ou assíncronas) ao middleware de erro.

function asyncHandler(fn) {
  return (req, res, next) => {
    try {
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = asyncHandler;
