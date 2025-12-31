export enum ROUTES {
  EventPage = "/event/:naddr",
}

export function getEventPage(naddr: string, viewKey?: string) {
  const urlParam = new URLSearchParams()
  if(viewKey) {
    urlParam.append("viewKey", viewKey)
  }
  return `/event/${naddr}?${urlParam.toString()}`;
}
