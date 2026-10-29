/** iPad desktop mode identifies as a Mac, so include its touch capability. */
export function groundDeviceBlocked(userAgent:string,maxTouchPoints:number) {
 return /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(userAgent)
  || (/Macintosh/i.test(userAgent)&&maxTouchPoints>1);
}
