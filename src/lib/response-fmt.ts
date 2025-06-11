export function responseFormater<T extends object, K extends object>(
  message: string,
  data: T,
  metaData?: K,
  success = true
) {
  return {
    success,
    message,
    data,
    ...(metaData && metaData),
  };
}
