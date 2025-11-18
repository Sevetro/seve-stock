import { errors } from '../shared-with-ui/errors.js';

export function isError(err: unknown): err is Error {
  return err instanceof Error;
}
function isTypeError(err: unknown): err is TypeError {
  return err instanceof TypeError;
}

export function getErrorMsg(err: unknown) {
  if (isTypeError(err)) {
    return `${err.message} ${err.cause}`;
  } else if (isError(err)) {
    return err.message;
  } else {
    return errors.unknownError;
  }
}