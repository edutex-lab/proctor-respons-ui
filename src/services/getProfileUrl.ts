export function getProfileUrl(lms: string): string {
  const profileEndpoints: Record<string, string> = {
    edunex: "https://api-edunex.cognisia.id/login/me",
  };

  const key = lms.toLowerCase();
  const url = profileEndpoints[key];

  if (!url) {
    throw new Error(`Unknown LMS: ${lms}`);
  }

  return url;
}

export default getProfileUrl;

