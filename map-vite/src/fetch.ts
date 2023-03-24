export async function fetchJSON<T>(props: {queryKey: [string]}): Promise<T> {
  const response = await fetch(props.queryKey[0]);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
}
