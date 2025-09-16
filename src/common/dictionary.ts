export type NestedObject = Record<string, NestedObject | string>;

const dictionary: NestedObject = {
  "en-US": {
    rsvp: {
      accepted: "Accepted",
      declined: "Declined", 
      maybe: "Maybe",
      pending: "Pending",
    },
    navigation: {
      today: "today",
      previousDay: "Previous day",
      previousWeek: "Previous week",
      previousMonth: "Previous month",
      nextDay: "Next day",
      nextWeek: "Next week",
      nextMonth: "Next month",
      next: "next",
      day: "Day",
      week: "Week",
      month: "Month",
      year: "Year",
      login: "Log In",
      logout: "Log Out",
      save: "Save",
      timeSelectorPlaceholder: "Time",
      description: "Desciption",
      location: "Location",
      participants: "Participants",
      addParticipants: "Enter participant nPub",
      rsvpDetails: "RSVP Details",
      privateEvent: "Private Event",
      privateEventCaption:
        "Private events are only visible to you and the invited participants",
    },
    filters: {
      showPublicEvents: "Show Public Events",
    },
    message: {
      title: 'Calendar by Formstr',
      modeSelection_description: 'Choose how you\'d like to use the calendar',
      modeSelection_loginButton: 'Login with Nostr',
      modeSelection_guestButton: 'Continue as Guest',
      modeSelection_loginInfo: 'Login to save and sync events across devices',
      login_description: 'Login to manage your events',
      login_error: 'Login failed'
    }
  },
  "de-DE": {
    rsvp: {
      accepted: "Angenommen",
      declined: "Abgelehnt",
      maybe: "Vielleicht", 
      pending: "Ausstehend",
    },
    navigation: {
      today: "Heute",
      previousDay: "Vortag",
      previousWeek: "Vorwoche",
      previousMonth: "Vormonat",
      nextDay: "Morgen",
      nextWeek: "nächste Woche",
      nextMonth: "nächster Monat",
      previous: "vorhergehend",
      next: "nächster",
      day: "Tag",
      week: "Woche",
      month: "Monat",
      year: "Jahr",
      login: "anmelden",
      logout: "abmelden",
      timeSelectorPlaceholder: "Zeit",
      save: "speichern",
      description: "Beschreibung",
      location: "Ort",
      participants: "Teilnehmer",
      addParticipants: "Teilnehmer nPub eingeben",
      rsvpDetails: "RSVP Details",
      privateEvent: "Privates Ereignis",
      privateEventCaption:
        "Private Ereignisse sind nur für Sie und die eingeladenen Teilnehmer sichtbar",
    },
    filters: {
      showPublicEvents: "Öffentliche Ereignisse anzeigen",
    },
    message: {
      title: 'Kalender von Formstr',
      modeSelection_description: 'Wählen Sie, wie Sie den Kalender verwenden möchten',
      modeSelection_loginButton: 'Mit Nostr anmelden',
      modeSelection_guestButton: 'Als Gast fortfahren',
      modeSelection_loginInfo: 'Melden Sie sich an, um Ereignisse zu speichern und geräteübergreifend zu synchronisieren',
      login_description: 'Anmelden, um Ihre Ereignisse zu verwalten',
      login_error: 'Anmeldung fehlgeschlagen'
    }
  },
};
export default dictionary;
