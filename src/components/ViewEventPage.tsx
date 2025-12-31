import {  NAddr } from "nostr-tools/nip19";
import React from "react";
import { useParams, useSearchParams } from "react-router";
import { ICalendarEvent } from "../stores/events";
import { fetchCalendarEvent, viewPrivateEvent } from "../common/nostr";

export const ViewEventPage = () => {
  const { naddr } = useParams<{ naddr: string }>();
  const [queryParams] = useSearchParams()
  const viewKey = queryParams.get('viewKey')
  const [calendarEvent, updateCalendarEvent] = React.useState<ICalendarEvent | null>(null)
  const [fetchState, updateFetchState] = React.useState<"loading" | "fetched" | "error">("loading")
  const [error, updateError] = React.useState<Error | null>(null)
  if (!naddr) {
    return null;
  }
  
  React.useEffect(() => {
    updateFetchState("loading")
    fetchCalendarEvent(naddr as NAddr, viewKey).then((event) => {
      updateFetchState("fetched")
      if(viewKey) {
       const privateEvent = viewPrivateEvent(event, viewKey)
        updateCalendarEvent(privateEvent)
      } else {
        updateCalendarEvent(event)
      }
    }).catch((e) => {
      updateFetchState("error")
      updateError(e)
      console.log(e)
    })
  }, [naddr, viewKey, updateFetchState])

  return <pre>{JSON.stringify({calendarEvent, fetchState, error}, undefined, 4)}</pre>;
};
